class SettingsManager {
    constructor() {
        this.loadSettings();
        this.setupEventListeners();
    }

    loadSettings() {
        // Load voice settings
        const voiceEnabled = localStorage.getItem('voiceEnabled') !== 'false';
        const voiceSpeed = parseFloat(localStorage.getItem('voiceSpeed')) || 1;
        const voicePitch = parseFloat(localStorage.getItem('voicePitch')) || 1;
        const apiKey = localStorage.getItem('geminiApiKey') || '';

        // Update UI elements
        document.getElementById('voiceEnabled').checked = voiceEnabled;
        document.getElementById('voiceSpeed').value = voiceSpeed;
        document.getElementById('voicePitch').value = voicePitch;
        document.getElementById('apiKey').value = apiKey;
    }

    setupEventListeners() {
        // Add event listeners for real-time updates
        document.getElementById('voiceSpeed').addEventListener('input', (e) => {
            this.updateVoiceSpeed();
        });

        document.getElementById('voicePitch').addEventListener('input', (e) => {
            this.updateVoicePitch();
        });
    }

    toggleVoiceResponses() {
        const enabled = document.getElementById('voiceEnabled').checked;
        localStorage.setItem('voiceEnabled', enabled);
        
        // Show feedback
        this.showFeedback(`Voice responses ${enabled ? 'enabled' : 'disabled'}`);
    }

    updateVoiceSpeed() {
        const speed = document.getElementById('voiceSpeed').value;
        localStorage.setItem('voiceSpeed', speed);
        
        // Test the voice with new speed
        this.testVoice();
    }

    updateVoicePitch() {
        const pitch = document.getElementById('voicePitch').value;
        localStorage.setItem('voicePitch', pitch);
        
        // Test the voice with new pitch
        this.testVoice();
    }

    testVoice() {
        if ('speechSynthesis' in window) {
            const synthesis = window.speechSynthesis;
            
            // Cancel any ongoing speech
            synthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance("Hi! This is how I sound with the current settings.");
            utterance.rate = parseFloat(document.getElementById('voiceSpeed').value);
            utterance.pitch = parseFloat(document.getElementById('voicePitch').value);
            
            // Try to use a female voice
            const voices = synthesis.getVoices();
            const femaleVoice = voices.find(voice => 
                voice.name.toLowerCase().includes('female') || 
                voice.name.toLowerCase().includes('woman') ||
                voice.name.toLowerCase().includes('samantha') ||
                voice.name.toLowerCase().includes('karen')
            );
            
            if (femaleVoice) {
                utterance.voice = femaleVoice;
            }

            synthesis.speak(utterance);
        }
    }

    saveApiKey() {
        const apiKey = document.getElementById('apiKey').value.trim();
        
        if (apiKey) {
            localStorage.setItem('geminiApiKey', apiKey);
            this.showFeedback('API key saved successfully! 🎉');
        } else {
            localStorage.removeItem('geminiApiKey');
            this.showFeedback('API key removed');
        }
    }

    showFeedback(message) {
        // Create or update feedback element
        let feedback = document.getElementById('settingsFeedback');
        if (!feedback) {
            feedback = document.createElement('div');
            feedback.id = 'settingsFeedback';
            feedback.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                padding: 1rem 2rem;
                border-radius: 10px;
                box-shadow: 0 5px 20px rgba(0,0,0,0.2);
                z-index: 1000;
                transform: translateX(100%);
                transition: transform 0.3s ease;
            `;
            document.body.appendChild(feedback);
        }

        feedback.textContent = message;
        
        // Show feedback
        setTimeout(() => {
            feedback.style.transform = 'translateX(0)';
        }, 100);

        // Hide feedback after 3 seconds
        setTimeout(() => {
            feedback.style.transform = 'translateX(100%)';
        }, 3000);
    }

    exportSettings() {
        const settings = {
            voiceEnabled: localStorage.getItem('voiceEnabled'),
            voiceSpeed: localStorage.getItem('voiceSpeed'),
            voicePitch: localStorage.getItem('voicePitch'),
            apiKey: localStorage.getItem('geminiApiKey'),
            chatHistory: localStorage.getItem('chatHistory')
        };

        const dataStr = JSON.stringify(settings, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = 'ai-girlfriend-settings.json';
        link.click();
        
        this.showFeedback('Settings exported successfully!');
    }

    importSettings(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const settings = JSON.parse(e.target.result);
                
                // Import settings
                Object.keys(settings).forEach(key => {
                    if (settings[key] !== null) {
                        localStorage.setItem(key, settings[key]);
                    }
                });

                // Reload the page to apply settings
                this.showFeedback('Settings imported successfully! Reloading...');
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
                
            } catch (error) {
                this.showFeedback('Error importing settings. Please check the file format.');
                console.error('Import error:', error);
            }
        };
        
        reader.readAsText(file);
    }

    resetSettings() {
        if (confirm('Are you sure you want to reset all settings? This will also clear your chat history.')) {
            localStorage.clear();
            this.showFeedback('All settings reset! Reloading...');
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        }
    }
}

// Global functions for HTML onclick events
function toggleVoiceResponses() {
    settingsManager.toggleVoiceResponses();
}

function updateVoiceSpeed() {
    settingsManager.updateVoiceSpeed();
}

function updateVoicePitch() {
    settingsManager.updateVoicePitch();
}

function saveApiKey() {
    settingsManager.saveApiKey();
}

function exportSettings() {
    settingsManager.exportSettings();
}

function importSettings(event) {
    settingsManager.importSettings(event);
}

function resetSettings() {
    settingsManager.resetSettings();
}

// Initialize settings manager
let settingsManager;
document.addEventListener('DOMContentLoaded', function() {
    settingsManager = new SettingsManager();
    
    // Add export/import buttons to settings section
    const settingsSection = document.querySelector('.settings-section');
    if (settingsSection) {
        const buttonsDiv = document.createElement('div');
        buttonsDiv.style.cssText = 'margin-top: 2rem; display: flex; gap: 1rem; flex-wrap: wrap;';
        buttonsDiv.innerHTML = `
            <button onclick="exportSettings()" style="
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                border: none;
                padding: 0.8rem 1.5rem;
                border-radius: 10px;
                cursor: pointer;
                font-weight: 500;
            ">Export Settings</button>
            
            <label style="
                background: #4CAF50;
                color: white;
                border: none;
                padding: 0.8rem 1.5rem;
                border-radius: 10px;
                cursor: pointer;
                font-weight: 500;
                display: inline-block;
            ">
                Import Settings
                <input type="file" accept=".json" onchange="importSettings(event)" style="display: none;">
            </label>
            
            <button onclick="resetSettings()" style="
                background: #ff4757;
                color: white;
                border: none;
                padding: 0.8rem 1.5rem;
                border-radius: 10px;
                cursor: pointer;
                font-weight: 500;
            ">Reset All</button>
        `;
        settingsSection.appendChild(buttonsDiv);
    }
});