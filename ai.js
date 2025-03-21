
//----------------------------- Ai Worker -----------------------------------

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
    }
});

//----------------------------- In/Output -----------------------------------

async function generateAnswer() {
    if (isGenerating || !input.value.trim()) return;
    isGenerating = true;
    const userMessage = input.value.trim();
    umami.track("Ai User Message", {message_data: userMessage});
    addMessage('user', userMessage);
    input.value = '';
    currentResponseDiv = addMessage('assistant', 'Thinking...');
    aiWorker.postMessage({ message: userMessage, topic: "input" });
    setTimeout(() => {
        isGenerating = false;
    }, 500);
}

const input = document.getElementById('ai_input');
const sendButton = document.getElementById('send-button');
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

sendButton.addEventListener('click', generateAnswer);

modelChangeButton.addEventListener('click', () => {
    popup.style.display = popup.style.display === '' || popup.style.display === 'none' ? 'block' : 'none';
});
document.addEventListener('click', (event) => {
    if (popup.style.display === 'block' && !popup.contains(event.target) && !modelChangeButton.contains(event.target)) {
        popup.style.display = 'none';
    }
});
document.getElementById('model_medium').addEventListener('click', (event) => {
    aiWorker.postMessage({ message: "medium", topic: "model" });
    addMessage('assistant', `Changing model to SmolLM2-360M-Instruct ...`);
    popup.style.display = 'none';
    umami.track('Set Model', {model_data: 'medium'});
})
document.getElementById('model_small').addEventListener('click', (event) => {
    aiWorker.postMessage({ message: "small", topic: "model" });
    addMessage('assistant', `Changing model to SmolLM2-135M-Instruct ...`);
    popup.style.display = 'none';
    umami.track('Set Model', {model_data: 'small'});
})
document.getElementById('model_big').addEventListener('click', (event) => {
    aiWorker.postMessage({ message: "big", topic: "model" });
    addMessage('assistant', `Changing model to SmolLM2-1.7B-Instruct ...`);
    popup.style.display = 'none';
    umami.track('Set Model', {model_data: 'big'});
})

// Show a welcome message when the page loads
window.addEventListener('DOMContentLoaded', () => {
    if (chatMessages.children.length === 0) {
        addMessage('assistant', 'Hi! Go to Settings to choose a model and start chatting.');
    }
});
