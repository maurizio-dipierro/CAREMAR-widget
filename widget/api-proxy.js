import { convertMarkdownToHtml } from './markdown.js';

let apikey = '';
let apiUrl = '';

let conversationId = '';
let lastUserQuestion = '';
let API_URL_STREAM = '';
let FEEDBACK_API_URL = '';

let chatInput;
let sendButton;
let typingIndicator;
let chatMessages;
let getCurrentTime = () => '';

const feedbackErrorTypes = [
    { value: "wrong_context", label: "Contesto sbagliato: la risposta cita una fonte vera ma non pertinente alla domanda" },
    { value: "wrong_tone", label: "Tono sbagliato: la risposta è troppo informale per il contesto" },
    { value: "factual_error", label: "Fatto errato: la risposta contiene un'informazione sbagliata (es. data, numero, nome)" },
    { value: "incoherent_response", label: "Risposta incoerente: la risposta non è coerente con lo scambio precedente nella conversazione" },
    { value: "incomplete_response", label: "Risposta incompleta: manca una parte fondamentale della risposta" },
    { value: "ambiguous", label: "Ambiguità: la risposta può essere interpretata in più modi" },
    { value: "repetition", label: "Ripetizione: il contenuto è ridondante o ripete più volte lo stesso concetto" },
    { value: "other", label: "Altro (specificare nel commento)" }
];

export async function initApi(config, elements, utils) {
    ({ apiUrl, apikey } = config);
    ({ chatInput, sendButton, typingIndicator, chatMessages } = elements);
    if (utils && typeof utils.getCurrentTime === 'function') {
        getCurrentTime = utils.getCurrentTime;
    }

    // 1) Obtain a client_token from the proxy
    try {
        const tokenRes = await fetch(`${apiUrl}/shop/token`, {
            method: 'GET',
            headers: { 'x-api-key': apikey }
        });
        if (!tokenRes.ok) {
            console.error('Could not fetch client token:', await tokenRes.text());
            throw new Error('Authentication failed');
        }
        const { client_token } = await tokenRes.json();
        conversationId = client_token;
    } catch (error) {
        console.error('Error getting client token:', error);
        throw error;
    }

    // 2) Configure endpoints to use the proxy
    API_URL_STREAM = `${apiUrl}/widget/query`;
    FEEDBACK_API_URL = `${apiUrl}/feedback`;
}

export async function sendFeedbackToServer(messageDiv, feedbackValue, comment) {
    const answerElement = messageDiv.querySelector('.message-content-text');
    const answerText = answerElement ? answerElement.innerText : messageDiv.innerText;

    const payload = {
        client_token: conversationId,      // ← use the correct field name
        question:     lastUserQuestion,
        answer:       answerText,
        feedback:     feedbackValue,
        comment:      comment || ""         // ← always include, default to empty string
    };
    if (comment) {
        payload.comment = comment;
    }

    try {
        const response = await fetch(FEEDBACK_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apikey,
            },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            console.error("Feedback API Error:", response.status, await response.text());
            return;
        }
        const data = await response.json();
        console.log('Feedback logged:', data);
    } catch (error) {
        console.error('Error logging feedback:', error);
    }
}

export function handleFeedback(messageDiv, feedbackType) {
    if (messageDiv.dataset.feedbackSent === "true") {
        return;
    }

    const thumbsUpButton = messageDiv.querySelector('.feedback-button.thumbs-up');
    const thumbsDownButton = messageDiv.querySelector('.feedback-button.thumbs-down');

    const existingErrorForm = messageDiv.querySelector('.feedback-error-selection-form');
    if (existingErrorForm) {
        existingErrorForm.remove();
    }

    if (feedbackType === 'up') {
        messageDiv.dataset.feedbackSent = "true";
        thumbsUpButton.classList.add('selected');
        if(thumbsDownButton) thumbsDownButton.disabled = true;
        sendFeedbackToServer(messageDiv, 'True', null);
    } else if (feedbackType === 'down') {
        const errorForm = document.createElement('div');
        errorForm.className = 'feedback-error-selection-form';

        let errorOptionsHTML = '<div class="error-types-title">Tipo di problema riscontrato:</div>';
        feedbackErrorTypes.forEach((type) => {
            const checkedAttribute = type.value === 'altro' ? 'checked' : '';
            const radioId = `error-${type.value}-${messageDiv.dataset.messageId || conversationId}`;
            errorOptionsHTML += `
                <div class="feedback-error-option">
                    <input type="radio" id="${radioId}" name="feedbackErrorType-${messageDiv.dataset.messageId || conversationId}" value="${type.value}" ${checkedAttribute}>
                    <label for="${radioId}">${type.label}</label>
                </div>
            `;
        });

        errorForm.innerHTML = `
            ${errorOptionsHTML}
            <textarea placeholder="Aggiungi un commento..." rows="3"></textarea>
            <div class="feedback-error-actions">
                <button class="submit-feedback">Invia Feedback</button>
                <button class="cancel-feedback">Annulla</button>
            </div>
        `;

        const feedbackContainer = messageDiv.querySelector('.feedback-container');
        if (feedbackContainer) {
            feedbackContainer.insertAdjacentElement('afterend', errorForm);
        } else {
            messageDiv.appendChild(errorForm);
        }
        const textarea = errorForm.querySelector('textarea');
        if (textarea) textarea.focus();

        errorForm.querySelector('.submit-feedback').addEventListener('click', () => {
            const userCommentText = textarea ? textarea.value.trim() : "";
            const selectedErrorInput = errorForm.querySelector('input[name^="feedbackErrorType"]:checked');

            let finalComment = "";
            let selectedErrorLabel = "";

            if (selectedErrorInput) {
                const errorValue = selectedErrorInput.value;
                const errorTypeObj = feedbackErrorTypes.find(et => et.value === errorValue);
                if (errorTypeObj) {
                    selectedErrorLabel = errorTypeObj.value;
                }
            }

            if (selectedErrorLabel) {
                finalComment = selectedErrorLabel;
                if (userCommentText) {
                    finalComment += ": " + userCommentText;
                }
            } else if (userCommentText) {
                finalComment = userCommentText;
            }

            messageDiv.dataset.feedbackSent = "true";
            if(thumbsDownButton) thumbsDownButton.classList.add('selected');
            if(thumbsUpButton) thumbsUpButton.disabled = true;

            sendFeedbackToServer(messageDiv, 'False', finalComment || "Feedback negativo senza commento specifico.");
            errorForm.remove();
        });

        errorForm.querySelector('.cancel-feedback').addEventListener('click', () => {
            errorForm.remove();
        });
    }
}

export function addFeedbackButtons(messageDiv) {
    if (messageDiv.querySelector('.feedback-container')) {
        return;
    }
    if (!messageDiv.dataset.messageId) {
        messageDiv.dataset.messageId = `msg-${Date.now()}-${Math.random().toString(36).substring(2,7)}`;
    }

    const feedbackContainer = document.createElement('div');
    feedbackContainer.className = 'feedback-container';

    const thumbsUpButton = document.createElement('button');
    thumbsUpButton.className = 'feedback-button thumbs-up';
    thumbsUpButton.innerHTML = '👍';
    thumbsUpButton.title = 'Feedback positivo';
    thumbsUpButton.addEventListener('click', (e) => {
        e.stopPropagation();
        handleFeedback(messageDiv, 'up');
    });

    const thumbsDownButton = document.createElement('button');
    thumbsDownButton.className = 'feedback-button thumbs-down';
    thumbsDownButton.innerHTML = '👎';
    thumbsDownButton.title = 'Feedback negativo';
    thumbsDownButton.addEventListener('click', (e) => {
        e.stopPropagation();
        handleFeedback(messageDiv, 'down');
    });

    feedbackContainer.appendChild(thumbsUpButton);
    feedbackContainer.appendChild(thumbsDownButton);
    messageDiv.appendChild(feedbackContainer);
}

export function addMessage(messageText, isUser) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;

    const messageContentSpan = document.createElement('span');
    messageContentSpan.className = 'message-content-text';
    if (isUser) {
        messageContentSpan.innerText = messageText;
    } else {
        messageContentSpan.innerHTML = messageText;
    }
    messageDiv.appendChild(messageContentSpan);

    const timeSpan = document.createElement('span');
    timeSpan.className = 'message-time';
    timeSpan.textContent = getCurrentTime();
    messageDiv.appendChild(timeSpan);

    if (!isUser) {
        if (!messageDiv.dataset.messageId) {
            messageDiv.dataset.messageId = `msg-${Date.now()}-${Math.random().toString(36).substring(2,7)}`;
        }
        addFeedbackButtons(messageDiv);
    }

    chatMessages.insertBefore(messageDiv, typingIndicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

export async function sendMessage() {

    // Guard: must have a conversationId
    if (!conversationId) {
        console.warn('No conversationId yet – please wait for initApi() to complete.');
        return;
    }

    const message = chatInput.value.trim();
    if (message === '') return;

    lastUserQuestion = message;

    chatInput.disabled = true;
    sendButton.disabled = true;

    addMessage(message, true);

    const streamingMessageDiv = document.createElement('div');
    streamingMessageDiv.className = 'message bot-message';
    streamingMessageDiv.dataset.messageId = `msg-${Date.now()}-${Math.random().toString(36).substring(2,7)}`;

    const streamingTextSpan = document.createElement('span');
    streamingTextSpan.className = 'message-content-text';
    streamingTextSpan.innerHTML = '<em>Sto scrivendo...</em>';
    streamingMessageDiv.appendChild(streamingTextSpan);

    const timeSpan = document.createElement('span');
    timeSpan.className = 'message-time';
    streamingMessageDiv.appendChild(timeSpan);

    chatMessages.insertBefore(streamingMessageDiv, typingIndicator);
    streamingMessageDiv.scrollIntoView({ behavior: 'smooth', block: 'end' });

    let streamingContent = '';

    try {
        const response = await fetch(API_URL_STREAM, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: message,
                client_token: conversationId,
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server responded with ${response.status}: ${errorText}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let done = false;
        let buffer = '';

        while (!done) {
            const { value, done: doneReading } = await reader.read();
            done = doneReading;
            buffer += decoder.decode(value, { stream: !done });
            const lines = buffer.split('\n');
            buffer = lines.pop();

            for (const line of lines) {
                if (line.trim() === '') continue;
                try {
                    const chunk = JSON.parse(line);
                    if (chunk.choices && chunk.choices[0].delta && chunk.choices[0].delta.content) {
                        const contentPiece = chunk.choices[0].delta.content;
                        streamingContent += contentPiece;
                        streamingTextSpan.innerHTML = convertMarkdownToHtml(streamingContent);
                        chatMessages.scrollTop = chatMessages.scrollHeight;
                    }
                } catch (e) {
                    console.error("Error parsing stream chunk:", line, e);
                }
            }
        }
        if (buffer.trim() !== '') {
            try {
                const chunk = JSON.parse(buffer);
                if (chunk.choices && chunk.choices[0].delta && chunk.choices[0].delta.content) {
                    const contentPiece = chunk.choices[0].delta.content;
                    streamingContent += contentPiece;
                }
            } catch (e) {
                console.error("Error parsing final stream chunk:", buffer, e);
            }
        }

        streamingTextSpan.innerHTML = convertMarkdownToHtml(streamingContent);
        timeSpan.textContent = getCurrentTime();
        addFeedbackButtons(streamingMessageDiv);

    } catch (error) {
        console.error('Errore durante la richiesta:', error);
        streamingTextSpan.innerHTML = 'Mi dispiace, si è verificato un errore nella comunicazione con il server. Per favore riprova più tardi.';
        timeSpan.textContent = getCurrentTime();
        addFeedbackButtons(streamingMessageDiv);
    } finally {
        chatInput.disabled = false;
        sendButton.disabled = false;
        chatInput.value = '';
        chatInput.focus();
        typingIndicator.style.display = 'none';
    }
}
