export function createUI() {
    const widgetStyles = `
        .chat-container {
            width: 350px;
            height: 550px;
            border-radius: 12px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            background: #fff;
            box-shadow: 0 5px 25px rgba(0,0,0,0.15);
            position: fixed;
            bottom: 20px;
            right: 20px;
            transition: all 0.3s ease;
            z-index: 9999;
        }
        .chat-container.maximized {
            width: 90vw;
            height: 90vh;
        }
        .chat-container.hidden {
            display: none;
        }
        .chat-header {
            background: linear-gradient(135deg, #fab909, #e87918);
            color: white;
            padding: 15px 20px;
            font-weight: 500;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .chat-title {
            display: flex;
            align-items: center;
            font-size: 16px;
            gap: 10px;
        }
        .chat-logo {
            width: 30px;
            height: 30px;
            background: #fff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: #3f51b5;
        }
        .control-buttons {
            display: flex;
            gap: 8px;
        }
        .control-button {
            background: rgba(255,255,255,0.1);
            border: none;
            color: white;
            cursor: pointer;
            padding: 5px 8px;
            font-size: 12px;
            line-height: 1;
            border-radius: 4px;
            transition: background 0.2s;
        }
        .control-button:hover {
            background: rgba(255,255,255,0.25);
        }
        .online-indicator {
            display: flex;
            align-items: center;
            font-size: 12px;
            margin-top: 4px;
            color: rgba(255,255,255,0.85);
        }
        .status-dot {
            width: 8px;
            height: 8px;
            background: #4CAF50;
            border-radius: 50%;
            margin-right: 5px;
        }
        .chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
            background: #f5f7fb;
        }
        .message {
            margin-bottom: 15px;
            max-width: 80%;
            padding: 12px 16px;
            border-radius: 18px;
            font-size: 14px;
            line-height: 1.4;
            clear: both;
            position: relative;
            word-wrap: break-word;
        }
        .user-message {
            background: #fab909;
            color: black;
            float: right;
            border-bottom-right-radius: 5px;
            box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
        .bot-message {
            background: white;
            color: #444;
            float: left;
            border-bottom-left-radius: 5px;
            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
            border: 1px solid #e0e0e0;
        }
        .message-content-text {
            display: inline-block;
            max-width: 100%;
        }
        .message-time {
            font-size: 10px;
            color: rgba(0,0,0,0.5);
            display: block;
            text-align: right;
            margin-top: 5px;
            clear: both;
        }
        .user-message .message-time {
            color: rgba(0,0,0,0.7);
        }
        .chat-input-container {
            padding: 15px 20px;
            background: white;
            border-top: 1px solid #eee;
            display: flex;
            gap: 10px;
            align-items: center;
        }
        .chat-input {
            flex: 1;
            padding: 12px 15px;
            border: 1px solid #e0e0e0;
            border-radius: 24px;
            outline: none;
            font-size: 14px;
            transition: border 0.3s, box-shadow 0.3s;
            font-family: inherit;
        }
        .chat-input:focus {
            border-color: #2772b0;
            box-shadow: 0 0 0 2px rgba(63,81,181,0.1);
        }
        .send-button {
            background: #fab909;
            color: white;
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            cursor: pointer;
            transition: background 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .send-button:hover {
            background: #e87918;
        }
        .send-button:disabled {
            background: #c5cae9;
            cursor: not-allowed;
        }
        .typing-indicator {
            display: none;
            background: white;
            padding: 12px 16px;
            border-radius: 18px;
            border-bottom-left-radius: 5px;
            color: #666;
            float: left;
            clear: both;
            margin-bottom: 15px;
            font-style: italic;
            font-size: 14px;
            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
            border: 1px solid #e0e0e0;
        }
        .send-icon {
            width: 18px;
            height: 18px;
            fill: white;
        }
        .chat-toggler {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #fab909, #dd7517);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 4px 10px rgba(0,0,0,0.2);
            z-index: 9998;
            transition: transform 0.3s, box-shadow 0.3s;
        }
        .chat-toggler:hover {
            transform: scale(1.05);
            box-shadow: 0 6px 15px rgba(0,0,0,0.25);
        }
        .chat-toggler-icon {
            color: white;
            font-size: 24px;
        }
        .welcome-msg {
            font-weight: bold;
            margin-bottom: 5px;
        }
        .chat-messages::-webkit-scrollbar {
            width: 6px;
        }
        .chat-messages::-webkit-scrollbar-track {
            background: #f5f7fb;
        }
        .chat-messages::-webkit-scrollbar-thumb {
            background: #c5cae9;
            border-radius: 3px;
        }
        .chat-messages::-webkit-scrollbar-thumb:hover {
            background: #9fa8da;
        }
        .feedback-container {
            margin-top: 8px;
            text-align: left;
            clear: both;
        }
        .feedback-button {
            background: transparent;
            border: none;
            cursor: pointer;
            font-size: 18px;
            margin-right: 8px;
            padding: 2px;
            border-radius: 4px;
        }
        .feedback-button:focus {
            outline: none;
            box-shadow: 0 0 0 2px rgba(250, 185, 9, 0.3);
        }
        .feedback-button.selected {
            background-color: rgba(250, 185, 9, 0.2);
        }
        .feedback-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .feedback-error-selection-form {
            margin-top: 10px;
            padding: 10px;
            background-color: #f9f9f9;
            border-radius: 8px;
            border: 1px solid #e0e0e0;
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        .feedback-error-selection-form .error-types-title {
            font-size: 13px;
            font-weight: 500;
            color: #333;
            margin-bottom: 4px;
        }
        .feedback-error-option {
            display: flex;
            align-items: flex-start;
            gap: 8px;
            font-size: 12px;
            color: #555;
        }
        .feedback-error-option input[type="radio"] {
            margin-top: 2px;
            accent-color: #fab909;
        }
        .feedback-error-option label {
            cursor: pointer;
            flex: 1;
        }

        .feedback-error-selection-form textarea {
            width: 100%;
            min-height: 50px;
            padding: 8px;
            border: 1px solid #ccc;
            border-radius: 4px;
            font-family: inherit;
            font-size: 13px;
            resize: vertical;
            box-sizing: border-box;
            margin-top: 8px;
        }
        .feedback-error-selection-form textarea:focus {
            outline: none;
            border-color: #fab909;
            box-shadow: 0 0 0 2px rgba(250, 185, 9, 0.2);
        }
        .feedback-error-actions {
            display: flex;
            justify-content: flex-end;
            gap: 8px;
            margin-top: 5px;
        }
        .feedback-error-selection-form button {
            padding: 6px 12px;
            border-radius: 4px;
            border: none;
            cursor: pointer;
            font-size: 13px;
            font-weight: 500;
            transition: background-color 0.2s;
        }
        .feedback-error-selection-form button.submit-feedback {
            background-color: #fab909;
            color: white;
        }
        .feedback-error-selection-form button.submit-feedback:hover {
            background-color: #e87918;
        }
        .feedback-error-selection-form button.cancel-feedback {
            background-color: #e0e0e0;
            color: #333;
        }
        .feedback-error-selection-form button.cancel-feedback:hover {
            background-color: #bdbdbd;
        }
    `;

    const widgetHTML = `
        <div class="chat-toggler" id="chatToggler">
            <span class="chat-toggler-icon">💬</span>
        </div>
        <div class="chat-container hidden" id="chatWidget">
            <div class="chat-header" id="chatHeader">
                <div class="chat-title">
                    <div class="chat-logo">C</div>
                    <div>
                        <span>Assistente Virtuale AI</span>
                        <div class="online-indicator">
                            <span class="status-dot"></span>
                            <span>Online</span>
                        </div>
                    </div>
                </div>
                <div class="control-buttons">
                    <button class="control-button" id="minimizeBtn" title="Minimizza">−</button>
                    <button class="control-button" id="restoreBtn" title="Ripristina">□</button>
                    <button class="control-button" id="maximizeBtn" title="Massimizza">▢</button>
                </div>
            </div>
            <div class="chat-messages" id="chatMessages">
                <div class="message bot-message">
                    <span class="message-content-text">
                        <div class="welcome-msg">Ciao! 👋</div>
                        Sono l'assistente AI Caremar. Posso assisterti con informazioni su <b>servizi, itinerari e processi di prenotazione</b> di CAREMAR. Ad esempio, posso rispondere a domande su <b>orari, tariffe, modalità di acquisto dei biglietti, condizioni di viaggio, rimborsi</b> e altro.
                    </span>
                    <span class="message-time">${getCurrentTime()}</span>
                    </div>
                <div id="typingIndicator" class="typing-indicator">Sto rispondendo...</div>
            </div>
            <div class="chat-input-container">
                <input type="text" class="chat-input" id="chatInput" placeholder="Scrivi un messaggio...">
                <button id="sendButton" class="send-button">
                    <svg class="send-icon" viewBox="0 0 24 24">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
                    </svg>
                </button>
            </div>
        </div>
    `;

    const styleSheet = document.createElement("style");
    styleSheet.innerText = widgetStyles;
    document.head.appendChild(styleSheet);

    const div = document.createElement('div');
    div.innerHTML = widgetHTML;
    document.body.appendChild(div);

    const chatWidget = document.getElementById('chatWidget');
    const chatToggler = document.getElementById('chatToggler');
    const minimizeBtn = document.getElementById('minimizeBtn');
    const restoreBtn = document.getElementById('restoreBtn');
    const maximizeBtn = document.getElementById('maximizeBtn');
    const chatInput = document.getElementById('chatInput');
    const sendButton = document.getElementById('sendButton');
    const typingIndicator = document.getElementById('typingIndicator');
    const chatMessages = document.getElementById('chatMessages');

    return { chatWidget, chatToggler, minimizeBtn, restoreBtn, maximizeBtn, chatInput, sendButton, typingIndicator, chatMessages };
}

export function getCurrentTime() {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
}

export function attachEventHandlers(elements, { sendMessage, addFeedbackButtons }) {
    const { chatWidget, chatToggler, minimizeBtn, restoreBtn, maximizeBtn, chatInput, sendButton, typingIndicator, chatMessages } = elements;

    const initialBotMessage = chatMessages.querySelector('.bot-message');
    if (initialBotMessage) {
        addFeedbackButtons(initialBotMessage);
    }

    chatToggler.addEventListener('click', () => {
        chatWidget.classList.remove('hidden');
        chatToggler.style.display = 'none';
    });

    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    sendButton.addEventListener('click', sendMessage);

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && !chatWidget.classList.contains('hidden')) {
            chatWidget.classList.add('hidden');
            chatToggler.style.display = 'flex';
        }
    });

    minimizeBtn.addEventListener('click', () => {
        chatWidget.classList.add('hidden');
        chatToggler.style.display = 'flex';
    });
    restoreBtn.addEventListener('click', () => {
        chatWidget.classList.remove('maximized');
    });
    maximizeBtn.addEventListener('click', () => {
        chatWidget.classList.add('maximized');
    });
}
