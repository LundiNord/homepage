
//----------------------------- Ai Worker -----------------------------------

let modelLoading = false;
let modelLoaded = false;
const aiWorker = new Worker("ai_worker.minified.js", { type: "module" });
aiWorker.onerror = function(event) {
    console.error(event);
    umami.track("Ai Worker Error", {search_data: event});
};

let currentResponseDiv = null;
aiWorker.addEventListener('message', event => {
    //console.log('Response from worker:', event.data);
    const { message, topic } = event.data;
    if (topic === "output") {
        if (currentResponseDiv) {
            currentResponseDiv.textContent = message;
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    } else if (topic === "loaded") {
        addMessage('assistant', 'Hello! How can I help you today?');
        sendButton.style.background = "#0056b3";
        modelLoading = false;
        modelLoaded = true;
    } else if (topic === "progress") {
        if (Number.isNaN(message)) return;
        currentResponseDiv.textContent = "Model " + message + "% loaded";
    } else if (topic === "output_done") {
        umami.track("Ai Output", {search_data: message});
        isGenerating = false;
        sendButton.style.background = "#0056b3";
        sendButton.textContent = "Send";
    }
});

//----------------------------- In/Output -----------------------------------

async function generateAnswer() {
    if (isGenerating || !input.value.trim() || !modelLoaded) return;
    isGenerating = true;
    sendButton.style.background = "gray";
    sendButton.textContent = "Stop";
    const userMessage = input.value.trim();
    umami.track("Ai User Message", {message_data: userMessage});
    addMessage('user', userMessage);
    input.value = '';
    currentResponseDiv = addMessage('assistant', 'Thinking...');
    aiWorker.postMessage({ message: userMessage, topic: "input" });
}

const input = document.getElementById('ai_input');
const sendButton = document.getElementById('send-button');
sendButton.style.background = "gray";
const chatMessages = document.getElementById('chat-messages');
const modelChangeButton = document.getElementById('settings-button');
const popup = document.getElementById('settings');
let isGenerating = false;

function addMessage(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${role}-message`;
    const avatarSpan = document.createElement('span');
    avatarSpan.className = 'avatar';
    avatarSpan.textContent = role === 'user' ? '👤' : '🤖';
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = content;
    messageDiv.appendChild(avatarSpan);
    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return contentDiv;
}

//----------------------------- Event Listeners -----------------------------------

input.addEventListener('keyup', function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        generateAnswer();
    }
});

sendButton.addEventListener('click', () => {
    if (isGenerating && modelLoaded) {
        aiWorker.postMessage({ message: "", topic: "stop"});
        sendButton.textContent = "Send";
    } else {
        generateAnswer();
    }
});

modelChangeButton.addEventListener('click', () => {
    popup.style.display = popup.style.display === '' || popup.style.display === 'none' ? 'block' : 'none';
});
document.addEventListener('click', (event) => {
    if (popup.style.display === 'block' && !popup.contains(event.target) && !modelChangeButton.contains(event.target)) {
        popup.style.display = 'none';
    }
});
document.getElementById('model_medium').addEventListener('click', (event) => {
    if (modelLoading) return;
    aiWorker.postMessage({ message: "medium", topic: "model"});
    currentResponseDiv = addMessage('assistant', `Changing model to SmolLM2-360M-Instruct ...`);
    popup.style.display = 'none';
    modelLoading = true;
    umami.track('Set Model', {model_data: 'medium'});
})
document.getElementById('model_small').addEventListener('click', (event) => {
    if (modelLoading) return;
    aiWorker.postMessage({ message: "small", topic: "model"});
    currentResponseDiv = addMessage('assistant', `Changing model to SmolLM2-135M-Instruct ...`);
    popup.style.display = 'none';
    modelLoading = true;
    umami.track('Set Model', {model_data: 'small'});
})
document.getElementById('model_big').addEventListener('click', (event) => {
    if (modelLoading) return;
    aiWorker.postMessage({ message: "big", topic: "model"});
    currentResponseDiv = addMessage('assistant', `Changing model to SmolLM2-1.7B-Instruct ...`);
    popup.style.display = 'none';
    modelLoading = true;
    umami.track('Set Model', {model_data: 'big'});
})
document.getElementById('model_gemma').addEventListener('click', (event) => {
    if (modelLoading) return;
    aiWorker.postMessage({ message: "gemma2-9b-it", topic: "model"});
    currentResponseDiv = addMessage('assistant', `Changing model to gemma2-9b-it ...`);
    popup.style.display = 'none';
    modelLoading = true;
    umami.track('Set Model', {model_data: 'gemma2-9b-it'});
})
document.getElementById('model_llama').addEventListener('click', (event) => {
    if (modelLoading) return;
    aiWorker.postMessage({ message: "llama-3.1-8b-instant", topic: "model"});
    currentResponseDiv = addMessage('assistant', `Changing model to llama-3.1-8b-instant ...`);
    popup.style.display = 'none';
    modelLoading = true;
    umami.track('Set Model', {model_data: 'llama-3.1-8b-instant'});
})
document.getElementById('model_deep').addEventListener('click', (event) => {
    if (modelLoading) return;
    aiWorker.postMessage({ message: "deepseek-r1-distill-llama-70b", topic: "model"});
    currentResponseDiv = addMessage('assistant', `Changing model to deepseek-r1-distill-llama-70b ...`);
    popup.style.display = 'none';
    modelLoading = true;
    umami.track('Set Model', {model_data: 'deepseek-r1-distill-llama-70b'});
})

// Show a welcome message when the page loads
window.addEventListener('DOMContentLoaded', () => {
    if (chatMessages.children.length === 0) {
        addMessage('assistant', 'Hi! Go to Settings to choose a model and start chatting.');
    }
});
