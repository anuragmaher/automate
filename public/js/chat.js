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
    try {
        console.log('Chat interface initialization started');
        
        // Check for API key in localStorage
        config.apiKey = localStorage.getItem('chat_api_key');
        console.log('API key retrieved from storage:', config.apiKey ? 'Yes (key exists)' : 'No (key missing)');
        
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
        } else {
            // Add welcome message if API key exists
            addMessage('bot', 'Hi there! I\'m your AI assistant. How can I help you today?');
        }

        // Check API connection
        checkApiConnection();
        
        console.log('Chat interface initialization completed');
    } catch (error) {
        console.error('Failed to initialize chat interface:', error);
        // Display error message directly in the UI
        if (elements.messages) {
            const errorMsg = document.createElement('div');
            errorMsg.classList.add('message', 'bot-message', 'error-message');
            errorMsg.innerHTML = `<div class="message-content">⚠️ Error initializing chat: ${error.message}</div>`;
            elements.messages.appendChild(errorMsg);
        } else {
            // Fallback if messages element isn't available
            document.body.innerHTML += `<div style="color: red; padding: 20px; text-align: center;">Error initializing chat: ${error.message}</div>`;
        }
    }
}

// Request API key from user
function requestApiKey() {
    const apiKey = prompt('Please enter your API key to use the chat:');
    if (apiKey) {
        config.apiKey = apiKey;
        localStorage.setItem('chat_api_key', apiKey);
    } else {
        // Show message if no API key provided
        addMessage('bot', 'Please provide an API key to use the chat. Refresh the page to try again.');
        elements.statusIndicator.classList.remove('online');
        elements.statusIndicator.classList.add('offline');
        elements.statusIndicator.title = 'API Key Missing';
    }
}

// Check if API is accessible
async function checkApiConnection() {
    try {
        console.log('Checking API connection...');
        // Test connection using a simple GET request
        const response = await fetch('/api', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        
        // Parse the response to check format
        const data = await response.json().catch(e => ({
            error: `Failed to parse API response: ${e.message}`
        }));
        
        console.log('API connection response:', data);
        
        if (response.ok) {
            console.log('API connection successful');
            updateConnectionStatus(true);
            
            // Only log, don't show error if API key not yet provided
            if (!config.apiKey) {
                console.log('No API key provided yet - skipping welcome message');
                return;
            }
        } else {
            throw new Error(`API connection failed with status ${response.status}`);
        }
    } catch (error) {
        console.error('API connection error:', error);
        updateConnectionStatus(false);
        
        // Only show connection error if API key has been provided
        if (config.apiKey) {
            addMessage('bot', 'Unable to connect to the chat API. Please check your connection.', true);
        }
    }
}

// Handle sending a message
function handleSendMessage() {
    const message = elements.userInput.value.trim();
    if (!message) return;
    
    // Add user message to the chat
    addMessage('user', message);
    
    // Clear input
    elements.userInput.value = '';
    elements.userInput.style.height = 'auto';
    
    // Send to API
    sendMessageToApi(message);
}

// Add a message to the chat interface
function addMessage(sender, text, isError = false) {
    // Sanitize input to prevent DOM token errors
    // This is a simple fix - text is escaped to prevent HTML injection
    const sanitizeText = (str) => {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    };

    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${sender}-message`);
    if (isError) messageDiv.classList.add('error-message');
    
    // Create message content
    const messageContent = document.createElement('div');
    messageContent.classList.add('message-content');
    
    // Process text for markdown-like formatting
    let processedText = sanitizeText(text);
    
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
                        console.log('Fallback response received:', fallbackData);
                        
                        // Extract the fallback response - handle multiple possible formats
                        let fallbackReply;
                        
                        if (fallbackData.completion) {
                            fallbackReply = fallbackData.completion;
                        } else if (fallbackData.success && fallbackData.result) {
                            if (typeof fallbackData.result === 'string') {
                                fallbackReply = fallbackData.result;
                            } else if (fallbackData.result.text) {
                                fallbackReply = fallbackData.result.text;
                            } else {
                                fallbackReply = JSON.stringify(fallbackData.result).substring(0, 500);
                            }
                        } else {
                            fallbackReply = 'I received your message but encountered an issue with my response.';
                        }
                        
                        await minDelay;
                        addMessage('bot', fallbackReply);
                        updateConnectionStatus(true);
                        return;
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
        
        if (!data.success) {
            console.error('Invalid API response format - missing success flag:', data);
            throw new Error('API returned an invalid response format');
        }
        
        // Extract the assistant's reply - handle different response formats
        let assistantReply = null;
        
        // Format 1: API returns direct completion field
        if (data.completion) {
            assistantReply = data.completion;
        } 
        // Format 2: API returns result with choices array
        else if (data.result && data.result.choices && data.result.choices.length > 0) {
            if (data.result.choices[0].message && data.result.choices[0].message.content) {
                assistantReply = data.result.choices[0].message.content;
            } else if (data.result.choices[0].text) {
                assistantReply = data.result.choices[0].text;
            }
        }
        // Format 3: API returns result directly as text
        else if (data.result && (typeof data.result === 'string')) {
            assistantReply = data.result;
        }
        
        // Default response if we couldn't extract from standard formats
        if (!assistantReply) {
            console.warn('Using fallback response extraction');
            // Try to extract from any available field
            assistantReply = data.text || 
                          data.content || 
                          (data.result ? (data.result.text || data.result.content || JSON.stringify(data.result).substring(0, 500)) : null) || 
                          'I processed your request but encountered an issue formatting my response.';
        }
        
        // Add bot message to UI and history
        console.log('Adding assistant reply to chat:', assistantReply);
        addMessage('bot', assistantReply);
        updateConnectionStatus(true);
        
    } catch (error) {
        console.error('API error:', error);
        addMessage('bot', `Error: ${error.message || 'Something went wrong. Please try again.'}`, true);
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

// Update connection status indicator
function updateConnectionStatus(isConnected) {
    if (elements.statusIndicator) {
        if (isConnected) {
            elements.statusIndicator.classList.remove('offline');
            elements.statusIndicator.classList.add('online');
            elements.statusIndicator.title = 'API Connected';
        } else {
            elements.statusIndicator.classList.remove('online');
            elements.statusIndicator.classList.add('offline');
            elements.statusIndicator.title = 'API Disconnected';
        }
    } else {
        console.warn('Status indicator element not found');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
