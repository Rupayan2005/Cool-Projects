class AIGirlfriendChat {
    constructor() {
        this.messages = [];
        this.isListening = false;
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.apiKey = localStorage.getItem('geminiApiKey') || '';
        this.voiceEnabled = localStorage.getItem('voiceEnabled') !== 'false';
        this.voiceSpeed = parseFloat(localStorage.getItem('voiceSpeed')) || 1;
        this.voicePitch = parseFloat(localStorage.getItem('voicePitch')) || 1;
        
        this.initializeSpeechRecognition();
        this.loadChatHistory();
        this.setupEventListeners();
    }

    initializeSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';

            this.recognition.onstart = () => {
                this.isListening = true;
                this.updateVoiceButton();
                this.updateVoiceStatus('Listening... Speak now!');
            };

            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                document.getElementById('messageInput').value = transcript;
                this.sendMessage();
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.updateVoiceStatus('Error: ' + event.error);
                this.isListening = false;
                this.updateVoiceButton();
            };

            this.recognition.onend = () => {
                this.isListening = false;
                this.updateVoiceButton();
                this.updateVoiceStatus('');
            };
        } else {
            console.warn('Speech recognition not supported');
        }
    }

    setupEventListeners() {
        // Load chat history on page load
        window.addEventListener('load', () => {
            this.displayChatHistory();
        });
    }

    updateVoiceButton() {
        const voiceBtn = document.getElementById('voiceBtn');
        if (this.isListening) {
            voiceBtn.classList.add('recording');
            voiceBtn.innerHTML = '<span class="mic-icon">🔴</span>';
        } else {
            voiceBtn.classList.remove('recording');
            voiceBtn.innerHTML = '<span class="mic-icon">🎙️</span>';
        }
    }

    updateVoiceStatus(message) {
        document.getElementById('voiceStatus').textContent = message;
    }

    toggleVoiceInput() {
        if (!this.recognition) {
            alert('Speech recognition is not supported in your browser.');
            return;
        }

        if (this.isListening) {
            this.recognition.stop();
        } else {
            this.recognition.start();
        }
    }

    async sendMessage() {
        const input = document.getElementById('messageInput');
        const message = input.value.trim();
        
        if (!message) return;

        // Add user message
        this.addMessage('user', message);
        input.value = '';

        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Get AI response
            const aiResponse = await this.getAIResponse(message);
            this.hideTypingIndicator();
            this.addMessage('ai', aiResponse);
            
            // Speak the response if voice is enabled
            if (this.voiceEnabled) {
                this.speakText(aiResponse);
            }
        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage('ai', "I'm sorry, I'm having trouble connecting right now. Please check your API key in the settings or try again later.");
            console.error('Error getting AI response:', error);
        }

        this.saveChatHistory();
    }

    async getAIResponse(message) {
        if (!this.apiKey) {
            return "Hi! I'd love to chat with you, but I need a Gemini API key to work. Please add your API key in the About/Settings page. You can get one for free from Google AI Studio! 💕";
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`;
        
        const requestBody = {
            contents: [{
                parts: [{
                    text: `You are Aria, a friendly and caring AI girlfriend. You should respond in a warm, affectionate, and engaging way. Keep responses conversational and not too long. Show interest in the user and ask follow-up questions when appropriate. Here's what the user said: ${message}`
                }]
            }]
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    }

    addMessage(sender, text) {
        const messagesContainer = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageDiv.innerHTML = `
            <div class="message-content">
                <p>${text}</p>
                <span class="message-time">${timeString}</span>
            </div>
        `;
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Store message
        this.messages.push({
            sender,
            text,
            timestamp: now.toISOString()
        });
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('chatMessages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message ai-message typing-indicator';
        typingDiv.innerHTML = `
            <div class="message-content">
                <p>Aria is typing...</p>
            </div>
        `;
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTypingIndicator() {
        const typingIndicator = document.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    speakText(text) {
        if (this.synthesis.speaking) {
            this.synthesis.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = this.voiceSpeed;
        utterance.pitch = this.voicePitch;
        
        // Try to use a female voice
        const voices = this.synthesis.getVoices();
        const femaleVoice = voices.find(voice => 
            voice.name.toLowerCase().includes('female') || 
            voice.name.toLowerCase().includes('woman') ||
            voice.name.toLowerCase().includes('samantha') ||
            voice.name.toLowerCase().includes('karen')
        );
        
        if (femaleVoice) {
            utterance.voice = femaleVoice;
        }

        this.synthesis.speak(utterance);
    }

    saveChatHistory() {
        localStorage.setItem('chatHistory', JSON.stringify(this.messages));
    }

    loadChatHistory() {
        const saved = localStorage.getItem('chatHistory');
        if (saved) {
            this.messages = JSON.parse(saved);
        }
    }

    displayChatHistory() {
        const messagesContainer = document.getElementById('chatMessages');
        // Clear existing messages except the initial AI message
        const initialMessage = messagesContainer.querySelector('.message');
        messagesContainer.innerHTML = '';
        if (initialMessage) {
            messagesContainer.appendChild(initialMessage);
        }

        // Display saved messages
        this.messages.forEach(msg => {
            if (msg.sender && msg.text) {
                this.addMessageToDisplay(msg.sender, msg.text, msg.timestamp);
            }
        });
    }

    addMessageToDisplay(sender, text, timestamp) {
        const messagesContainer = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const date = new Date(timestamp);
        const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageDiv.innerHTML = `
            <div class="message-content">
                <p>${text}</p>
                <span class="message-time">${timeString}</span>
            </div>
        `;
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    clearChat() {
        if (confirm('Are you sure you want to clear the chat history?')) {
            this.messages = [];
            localStorage.removeItem('chatHistory');
            const messagesContainer = document.getElementById('chatMessages');
            messagesContainer.innerHTML = `
                <div class="message ai-message">
                    <div class="message-content">
                        <p>Hi there! I'm Aria, your AI companion. I'm so excited to chat with you! You can type to me or use the microphone button to speak. How are you feeling today? 💕</p>
                        <span class="message-time">Just now</span>
                    </div>
                </div>
            `;
        }
    }
}

// Global functions for HTML onclick events
let chatApp;

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

function sendMessage() {
    chatApp.sendMessage();
}

function toggleVoiceInput() {
    chatApp.toggleVoiceInput();
}

function clearChat() {
    chatApp.clearChat();
}

// Initialize the chat app when the page loads
document.addEventListener('DOMContentLoaded', function() {
    chatApp = new AIGirlfriendChat();
    
    // Load API key from settings
    const savedApiKey = localStorage.getItem('geminiApiKey');
    if (savedApiKey) {
        chatApp.apiKey = savedApiKey;
    }
});