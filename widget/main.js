import { loadConfig } from './config.js';
import { createUI, getCurrentTime, attachEventHandlers } from './ui.js';
import { initApi, sendMessage, addFeedbackButtons } from './api-proxy.js';

(async function() {
    const config = await loadConfig();
    const elements = createUI();
    initApi(config, elements, { getCurrentTime });
    attachEventHandlers(elements, { sendMessage, addFeedbackButtons });
})();
