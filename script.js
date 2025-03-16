document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const startBtn = document.getElementById('startBtn');
    const statusElement = document.getElementById('status');
    const resultElement = document.getElementById('result');
    const visualizer = document.getElementById('visualization');

    // Detect mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Check if browser supports speech recognition
    window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!window.SpeechRecognition) {
        // Show a more helpful message for unsupported browsers
        statusElement.textContent = 'Speech recognition not supported by your browser';
        resultElement.innerHTML = 'This feature works best in Chrome or Edge. <a href="https://caniuse.com/speech-recognition" target="_blank">Learn more about browser support</a>';
        startBtn.disabled = true;
        
        // Create a container for browser compatibility info
        const compatDiv = document.createElement('div');
        compatDiv.className = 'browser-compat-warning';
        compatDiv.innerHTML = `
            <h3>Browser Compatibility Issue</h3>
            <p>The Web Speech API is currently best supported in:</p>
            <ul>
                <li>Google Chrome (desktop and Android)</li>
                <li>Microsoft Edge (desktop)</li>
                ${isMobile ? '<li>Safari on iOS has limited support</li>' : ''}
            </ul>
            <p>For the best experience, please open this page in one of these browsers.</p>
        `;
        
        // Insert after the controls div
        document.querySelector('.controls').after(compatDiv);
        return;
    }
    
    // Create speech recognition instance
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    // Variables to track state
    let isListening = false;
    let autoRestart = true;
    
    // Mobile-specific adjustments
    if (isMobile) {
        // Add mobile info message
        const mobileInfoDiv = document.createElement('div');
        mobileInfoDiv.className = 'mobile-info';
        mobileInfoDiv.innerHTML = `
            <p><strong>Mobile Device Detected</strong></p>
            <p>For best results on mobile:</p>
            <ul>
                <li>Use Chrome on Android or Safari on iOS</li>
                <li>Speak clearly and directly into the microphone</li>
                <li>Reduce background noise</li>
                <li>You may need to tap the Start Listening button to activate</li>
            </ul>
        `;
        document.querySelector('.status-container').after(mobileInfoDiv);
        
        // On mobile, don't auto-start (wait for user interaction)
        autoRestart = false;
        
        // Update status
        statusElement.textContent = 'Tap "Start Listening" to begin';
    } else {
        // Start listening immediately when page loads on desktop
        window.addEventListener('load', () => {
            startListening();
        });
    }
    
    // Button to manually start/stop listening
    startBtn.addEventListener('click', () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    });
    
    // Function to start listening
    function startListening() {
        try {
            recognition.start();
            isListening = true;
            statusElement.textContent = 'Listening...';
            startBtn.textContent = 'Stop Listening';
            animateVisualizer(true);
        } catch (error) {
            console.error('Error starting recognition:', error);
            statusElement.textContent = 'Error starting recognition';
        }
    }
    
    // Function to stop listening
    function stopListening() {
        recognition.stop();
        isListening = false;
        statusElement.textContent = 'Not listening';
        startBtn.textContent = 'Start Listening';
        animateVisualizer(false);
    }
    
    // Handle speech recognition results
    recognition.onresult = (event) => {
        const last = event.results.length - 1;
        const transcript = event.results[last][0].transcript.trim().toLowerCase();
        
        // Show what was recognized
        resultElement.textContent = `Recognized: "${transcript}"`;
        
        // Process commands if final result
        if (event.results[last].isFinal) {
            processCommand(transcript);
        }
    };
    
    // Process recognized commands
    function processCommand(command) {
        console.log('Processing command:', command);
        
        // Check for specific commands
        if (command.includes('hello')) {
            handleHello();
        } else if (command.includes('start')) {
            handleStart();
        } else if (command.includes('next')) {
            handleNext();
        }
    }
    
    // Command handlers
    function handleHello() {
        statusElement.textContent = 'Hello! I heard you!';
        resultElement.textContent = 'Command "hello" recognized';
        // You can add more actions here
    }
    
    function handleStart() {
        statusElement.textContent = 'Starting...';
        resultElement.textContent = 'Command "start" recognized';
        // You can add more actions here
    }
    
    function handleNext() {
        statusElement.textContent = 'Moving to next item...';
        resultElement.textContent = 'Command "next" recognized';
        // You can add more actions here
    }
    
    // Handle recognition end (auto restart if needed)
    recognition.onend = () => {
        console.log('Recognition ended');
        if (autoRestart && isListening) {
            console.log('Restarting recognition');
            recognition.start();
        } else {
            isListening = false;
            statusElement.textContent = isMobile ? 'Tap "Start Listening" to begin' : 'Not listening';
            startBtn.textContent = 'Start Listening';
            animateVisualizer(false);
        }
    };
    
    // Handle errors
    recognition.onerror = (event) => {
        console.error('Recognition error:', event.error);
        statusElement.textContent = `Error: ${event.error}`;
        
        // If permission denied, don't auto restart
        if (event.error === 'not-allowed') {
            autoRestart = false;
            isListening = false;
            startBtn.textContent = 'Start Listening';
            animateVisualizer(false);
        }
    };
    
    // Simple visualizer animation
    function animateVisualizer(active) {
        if (active) {
            // Create simple animation for visualizer
            visualizer.innerHTML = '';
            for (let i = 0; i < 20; i++) {
                const bar = document.createElement('div');
                bar.style.position = 'absolute';
                bar.style.bottom = '0';
                bar.style.width = '4px';
                bar.style.left = `${i * 5}%`;
                bar.style.backgroundColor = '#3498db';
                bar.style.borderRadius = '2px 2px 0 0';
                visualizer.appendChild(bar);
                
                // Animate each bar
                animateBar(bar);
            }
        } else {
            visualizer.innerHTML = '';
        }
    }
    
    function animateBar(bar) {
        if (!isListening) return;
        
        // Random height between 5px and 50px
        const height = Math.floor(Math.random() * 45) + 5;
        bar.style.height = `${height}px`;
        bar.style.transition = 'height 0.2s ease';
        
        // Continue animation
        setTimeout(() => {
            if (isListening) {
                animateBar(bar);
            }
        }, 200);
    }
});
