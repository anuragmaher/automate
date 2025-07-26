/**
 * AI Chat Interface
 * A simple chat interface that connects to the LLM API
 */

// Chat configuration
const config = {
    apiEndpoint: '/api/llm/chat',
    apiKey: '',  // Will be loaded from storage or input
    messageHistory: [],
    maxMessages: 100,  // Limit the number of messages to prevent memory issues
    typingDelay: 700,  // How long to show typing indicator before response
};

// DOM elements
const elements = {
    messages: document.getElementById('messages'),
    userInput: document.getElementById('user-input'),
    sendButton: document.getElementById('send-button'),
    typingIndicator: document.getElementById('typing-indicator'),
    statusIndicator: document.querySelector('.status-indicator')
};

// Initialize chat interface
function init() {
    // Check for API key in localStorage
    config.apiKey = localStorage.getItem('chat_api_key');
    
    // Set up event listeners
    elements.sendButton.addEventListener('click', handleSendMessage);
    elements.userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
        // Auto-grow the textarea
        setTimeout(() => {
            elements.userInput.style.height = 'auto';
            elements.userInput.style.height = Math.min(elements.userInput.scrollHeight, 120) + 'px';
        }, 0);
    });
    
    // If no API key, prompt for one
    if (!config.apiKey) {
        requestApiKey();
    }

    // Check API connection
    checkApiConnection();
}

// Request API key from user
function requestApiKey() {
    const apiKey = prompt('Please enter your API key to use the chat:');
    if (apiKey) {
        config.apiKey = apiKey;
        localStorage.setItem('chat_api_key', apiKey);
    } else {
        // Show message if no API key provided
        addMessage('Please provide an API key to use the chat. Refresh the page to try again.', 'bot');
        elements.statusIndicator.classList.remove('online');
        elements.statusIndicator.classList.add('offline');
        elements.statusIndicator.title = 'API Key Missing';
    }
}

// Check if API is accessible
async function checkApiConnection() {
    try {
        const response = await fetch('/api', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
            console.log('API connection successful');
            elements.statusIndicator.classList.add('online');
            elements.statusIndicator.title = 'API Connected';
        } else {
            throw new Error('API connection failed');
        }
    } catch (error) {
        console.error('API connection error:', error);
        elements.statusIndicator.classList.remove('online');
        elements.statusIndicator.classList.add('offline');
        elements.statusIndicator.title = 'API Disconnected';
        addMessage('⚠️ Unable to connect to the chat API. Please check your connection.', 'bot', true);
    }
}

// Handle sending a message
function handleSendMessage() {
    const message = elements.userInput.value.trim();
    if (!message) return;
    
    // Add user message to the chat
    addMessage(message, 'user');
    
    // Clear input
    elements.userInput.value = '';
    elements.userInput.style.height = 'auto';
    
    // Send to API
    sendMessageToApi(message);
}

// Add a message to the chat interface
function addMessage(text, sender, isError = false) {
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${sender}-message`);
    if (isError) messageDiv.classList.add('error-message');
    
    // Create message content
    const messageContent = document.createElement('div');
    messageContent.classList.add('message-content');
    
    // Process text for markdown-like formatting
    let processedText = text;
    
    // Handle code blocks (simplified)
    processedText = processedText.replace(/```(.+?)```/gs, (match, code) => {
        return `<pre>${code.trim()}</pre>`;
    });
    
    // Add text to message
    messageContent.innerHTML = processedText;
    messageDiv.appendChild(messageContent);
    
    // Add timestamp
    const timestamp = document.createElement('div');
    timestamp.classList.add('message-timestamp');
    timestamp.textContent = getTimestamp();
    messageDiv.appendChild(timestamp);
    
    // Add to DOM
    elements.messages.appendChild(messageDiv);
    
    // Save to history
    config.messageHistory.push({
        sender,
        text,
        timestamp: new Date().toISOString()
    });
    
    // Limit history size
    if (config.messageHistory.length > config.maxMessages) {
        config.messageHistory.shift();
    }
    
    // Scroll to bottom
    scrollToBottom();
}

// Send message to API
async function sendMessageToApi(message) {
    // Show typing indicator
    showTypingIndicator(true);
    
    try {
        // Prepare the messages array for chat endpoint
        const messages = [
            { role: 'system', content: 'You are a helpful assistant.' }
        ];
        
        // Add user message history for context (last few messages)
        config.messageHistory.slice(-10).forEach(msg => {
            if (msg.sender === 'user') {
                messages.push({ role: 'user', content: msg.text });
            } else if (msg.sender === 'bot') {
                messages.push({ role: 'assistant', content: msg.text });
            }
        });
        
        // Add the latest user message if not already included
        if (!messages.some(m => m.role === 'user' && m.content === message)) {
            messages.push({ role: 'user', content: message });
        }
        
        // Set a minimum delay for the typing indicator
        const minDelay = new Promise(resolve => setTimeout(resolve, config.typingDelay));
        
        // Send API request
        const response = await fetch(config.apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': config.apiKey
            },
            body: JSON.stringify({
                messages,
                model: 'gpt-3.5-turbo',  // Default model
                temperature: 0.7
            })
        });
        
        // Process response
        const data = await response.json();
        
        // Wait for the minimum typing delay
        await minDelay;
        
        // Handle errors
        if (!response.ok) {
            throw new Error(data.message || 'Error communicating with the AI');
        }
        
        // Add bot response
        if (data.success && data.completion) {
            addMessage(data.completion, 'bot');
        } else {
            throw new Error('Invalid response format');
        }
    } catch (error) {
        console.error('API error:', error);
        addMessage(`⚠️ ${error.message || 'Something went wrong. Please try again.'}`, 'bot', true);
    } finally {
        showTypingIndicator(false);
    }
}

// Show or hide typing indicator
function showTypingIndicator(show) {
    if (show) {
        elements.typingIndicator.classList.add('active');
    } else {
        elements.typingIndicator.classList.remove('active');
    }
}

// Get formatted timestamp
function getTimestamp() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Scroll to the bottom of the chat
function scrollToBottom() {
    elements.messages.scrollTop = elements.messages.scrollHeight;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
