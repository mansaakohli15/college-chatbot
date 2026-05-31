document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    const voiceBtn = document.getElementById('voiceBtn');
    const langBtn = document.getElementById('langBtn');
    const suggestionChips = document.querySelectorAll('.suggestion-chip');
    
    let isRecording = false;
    let recognition = null;
    let currentLanguage = 'en';
    
    // Initialize speech recognition if available
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            userInput.value = transcript;
            sendMessage();
            voiceBtn.classList.remove('recording');
        };
        
        recognition.onerror = function() {
            voiceBtn.classList.remove('recording');
            addMessage('Sorry, I could not hear you. Please try again.', 'bot');
        };
        
        recognition.onend = function() {
            voiceBtn.classList.remove('recording');
        };
    }
    
    // Voice button
    voiceBtn.addEventListener('click', function() {
        if (!recognition) {
            addMessage('Voice input is not supported in your browser. Please type your question.', 'bot');
            return;
        }
        
        if (isRecording) {
            recognition.stop();
            voiceBtn.classList.remove('recording');
            isRecording = false;
        } else {
            recognition.start();
            voiceBtn.classList.add('recording');
            isRecording = true;
        }
    });
    
    // Language button (simplified Hindi support)
    langBtn.addEventListener('click', function() {
        if (currentLanguage === 'en') {
            currentLanguage = 'hi';
            langBtn.style.background = '#E28B6E';
            addMessage('Namaste! Main ab Hindi mein bhi madad kar sakta hoon. Kripya English mein type karein (Beta version).', 'bot');
        } else {
            currentLanguage = 'en';
            langBtn.style.background = 'rgba(255, 255, 255, 0.2)';
            addMessage('Switched back to English. How can I help you?', 'bot');
        }
    });
    
    // Send message function
    function sendMessage() {
        const message = userInput.value.trim();
        if (message === '') return;
        
        addMessage(message, 'user');
        userInput.value = '';
        
        // Show typing indicator
        showTypingIndicator();
        
        // Send to backend
        fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': application/json,
            },
            body: JSON.stringify({ message: message })
        })
        .then(response => response.json())
        .then(data => {
            removeTypingIndicator();
            addMessage(data.response, 'bot');
        })
        .catch(error => {
            removeTypingIndicator();
            addMessage('Sorry, something went wrong. Please try again.', 'bot');
        });
    }
    
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas ${sender === 'bot' ? 'fa-robot' : 'fa-user'}"></i>
            </div>
            <div class="message-bubble">
                <p>${escapeHtml(text)}</p>
                <span class="message-time">${time}</span>
            </div>
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-bubble typing-indicator">
                <span></span><span></span><span></span>
            </div>
        `;
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    function removeTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) indicator.remove();
    }
    
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Event listeners
    sendBtn.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') sendMessage();
    });
    
    suggestionChips.forEach(chip => {
        chip.addEventListener('click', function() {
            userInput.value = this.textContent;
            sendMessage();
        });
    });
});