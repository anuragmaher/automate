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
    isProduction: window.location.hostname.includes('vercel.app'),  // Check if running in production
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
        
        // Handle API errors or use simple-prompt as fallback if chat fails
        let apiUrl = config.apiEndpoint;
        console.log('Sending request to:', apiUrl);
        
        // Send API request
        const response = await fetch(apiUrl, {
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
        if (!response.ok) {
            console.error(`API error: Status ${response.status}`);
            const errorData = await response.json().catch(() => {
                console.error('Failed to parse error response as JSON');
                return {};
            });
            console.error('Error details:', errorData);
            
            // If on Vercel and the chat endpoint fails, try the simple-prompt endpoint as fallback
            if (config.isProduction && config.apiEndpoint === '/api/llm/chat') {
                console.log('Attempting fallback to simple-prompt endpoint');
                try {
                    const fallbackResponse = await fetch('/api/llm/simple-prompt', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-api-key': config.apiKey
                        },
                        body: JSON.stringify({
                            prompt: message,
                            temperature: 0.7
                        })
                    });
                    
                    if (fallbackResponse.ok) {
                        const fallbackData = await fallbackResponse.json();
                        if (fallbackData.success && fallbackData.result) {
                            await minDelay;
                            const fallbackReply = fallbackData.result.text || fallbackData.result || 
                                               'I received your message but encountered an issue with my response.';
                            addMessage('bot', fallbackReply);
                            updateConnectionStatus(true);
                            return;
                        }
                    }
                } catch (fallbackError) {
                    console.error('Fallback request failed:', fallbackError);
                }
            }
            
            throw new Error(`API error ${response.status}: ${errorData.message || response.statusText}`);
        }

        // Safely parse the JSON response with error handling
        let data;
        try {
            data = await response.json();
            console.log('Received API response:', data);
        } catch (parseError) {
            console.error('Failed to parse API response as JSON:', parseError);
            throw new Error('Failed to parse API response');
        }
        
        await minDelay;  // Ensure typing indicator shows for at least the minimum time
        
        if (!data.success || !data.result) {
            console.error('Invalid API response format:', data);
            throw new Error('API returned an invalid response format');
        }
        
        // Extract the assistant's reply with better error handling
        let assistantReply;
        if (data.result.choices && data.result.choices.length > 0) {
            // Handle chat completion format
            if (data.result.choices[0].message && data.result.choices[0].message.content) {
                assistantReply = data.result.choices[0].message.content;
            } 
            // Handle completion format
            else if (data.result.choices[0].text) {
                assistantReply = data.result.choices[0].text;
            }
        }
        
        // Default response if we couldn't extract from standard formats
        if (!assistantReply) {
            console.warn('Using fallback response extraction');
            assistantReply = data.result.text || data.result.content || 
                          JSON.stringify(data.result).substring(0, 500) || 
                          'I processed your request but encountered an issue formatting my response.';
        }
        
        // Add bot message to UI and history
        addMessage('bot', assistantReply);
        updateConnectionStatus(true);
        
    } catch (error) {
        console.error('API error:', error);
        addMessage('bot', `⚠️ ${error.message || 'Something went wrong. Please try again.'}`, true);
        updateConnectionStatus(false);
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
