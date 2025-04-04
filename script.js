document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const startBtn = document.getElementById('startBtn');
    const statusElement = document.getElementById('status');
    const resultElement = document.getElementById('result');
    const visualizer = document.getElementById('visualization');
    const languageSelect = document.getElementById('languageSelect');
    const detectedLanguageElement = document.getElementById('detectedLanguage');

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
    recognition.lang = languageSelect.value; // Set initial language from select
    
    // Variables to track state
    let isListening = false;
    let autoRestart = true;
    let lastDetectedLanguage = '';
    
    // Command translations for different languages
    const commandTranslations = {
        'en-US': {
            hello: ['hello', 'hi', 'hey'],
            start: ['start', 'begin', 'go'],
            next: ['next', 'forward', 'continue']
        },
        'es-ES': {
            hello: ['hola', 'saludos', 'buenos días'],
            start: ['comenzar', 'iniciar', 'empezar'],
            next: ['siguiente', 'próximo', 'continuar']
        },
        'fr-FR': {
            hello: ['bonjour', 'salut', 'allô'],
            start: ['commencer', 'démarrer', 'débuter'],
            next: ['suivant', 'prochain', 'continuer']
        },
        'de-DE': {
            hello: ['hallo', 'guten tag', 'grüß dich'],
            start: ['starten', 'beginnen', 'anfangen'],
            next: ['weiter', 'nächste', 'fortfahren']
        },
        'it-IT': {
            hello: ['ciao', 'salve', 'buongiorno'],
            start: ['iniziare', 'cominciare', 'avviare'],
            next: ['prossimo', 'seguente', 'continuare']
        },
        'pt-BR': {
            hello: ['olá', 'oi', 'bom dia'],
            start: ['começar', 'iniciar', 'começar'],
            next: ['próximo', 'seguinte', 'continuar']
        },
        'zh-CN': {
            hello: ['你好', '您好', '嗨'],
            start: ['开始', '启动', '出发'],
            next: ['下一个', '继续', '前进']
        },
        'ja-JP': {
            hello: ['こんにちは', 'やあ', 'おはよう'],
            start: ['開始', 'スタート', '始める'],
            next: ['次', '次へ', '続ける']
        },
        'ko-KR': {
            hello: ['안녕하세요', '안녕', '여보세요'],
            start: ['시작', '시작하다', '출발'],
            next: ['다음', '다음으로', '계속']
        },
        'ru-RU': {
            hello: ['привет', 'здравствуйте', 'здравствуй'],
            start: ['начать', 'старт', 'начинать'],
            next: ['следующий', 'дальше', 'продолжить']
        },
        'ar-SA': {
            hello: ['مرحبا', 'السلام عليكم', 'أهلا'],
            start: ['ابدأ', 'انطلق', 'شغل'],
            next: ['التالي', 'استمر', 'المقبل']
        }
    };
    
    // Language detection function
    function detectLanguage(transcript) {
        // Simple language detection based on common words
        const languagePatterns = {
            'en-US': /\b(the|is|and|to|a|in|that|it|of|for)\b/i,
            'es-ES': /\b(el|la|es|y|de|en|que|por|un|una)\b/i,
            'fr-FR': /\b(le|la|est|et|de|en|que|pour|un|une)\b/i,
            'de-DE': /\b(der|die|das|ist|und|zu|in|den|dem|ein|eine)\b/i,
            'it-IT': /\b(il|la|è|e|di|in|che|per|un|una)\b/i,
            'pt-BR': /\b(o|a|é|e|de|em|que|para|um|uma)\b/i,
            'zh-CN': /[\u4e00-\u9fff]+/,
            'ja-JP': /[\u3040-\u309f\u30a0-\u30ff]+/,
            'ko-KR': /[\uac00-\ud7af\u1100-\u11ff]+/,
            'ru-RU': /[\u0400-\u04ff]+/,
            'ar-SA': /[\u0600-\u06ff\u0750-\u077f\u08a0-\u08ff]+/
        };
        
        // Check each language pattern
        for (const [lang, pattern] of Object.entries(languagePatterns)) {
            if (pattern.test(transcript)) {
                return lang;
            }
        }
        
        // Default to the selected language if detection fails
        return languageSelect.value;
    }
    
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
    
    // Language select change event
    languageSelect.addEventListener('change', () => {
        const selectedLanguage = languageSelect.value;
        recognition.lang = selectedLanguage;
        
        if (isListening) {
            // Restart recognition with new language
            stopListening();
            startListening();
        }
        
        // Update command list based on selected language
        updateCommandList(selectedLanguage);
    });
    
    // Update command list based on language
    function updateCommandList(language) {
        const commandList = document.querySelector('.command-list ul');
        const commands = commandTranslations[language] || commandTranslations['en-US'];
        
        commandList.innerHTML = `
            <li>"${commands.hello[0]}" - Greet the website</li>
            <li>"${commands.start[0]}" - Begin an action</li>
            <li>"${commands.next[0]}" - Move to the next item</li>
        `;
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
            recognition.lang = languageSelect.value;
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
        
        // Attempt to detect language
        const detectedLang = detectLanguage(transcript);
        
        // Update detected language display if it changed
        if (detectedLang !== lastDetectedLanguage) {
            lastDetectedLanguage = detectedLang;
            
            // Find the language name from the select options
            const selectedOption = Array.from(languageSelect.options).find(option => option.value === detectedLang);
            const languageName = selectedOption ? selectedOption.text : detectedLang;
            
            detectedLanguageElement.textContent = `Detected: ${languageName}`;
            
            // If detected language is different from selected, suggest switching
            if (detectedLang !== languageSelect.value) {
                detectedLanguageElement.textContent += ' (Click to switch)';
                detectedLanguageElement.style.cursor = 'pointer';
                detectedLanguageElement.onclick = () => {
                    languageSelect.value = detectedLang;
                    recognition.lang = detectedLang;
                    updateCommandList(detectedLang);
                    
                    // Restart recognition with new language
                    if (isListening) {
                        stopListening();
                        startListening();
                    }
                };
            } else {
                detectedLanguageElement.style.cursor = 'default';
                detectedLanguageElement.onclick = null;
            }
        }
        
        // Process commands if final result
        if (event.results[last].isFinal) {
            processCommand(transcript, lastDetectedLanguage);
        }
    };
    
    // Process recognized commands
    function processCommand(command, language) {
        console.log('Processing command:', command, 'Language:', language);
        
        // Get command translations for the detected language
        const commands = commandTranslations[language] || commandTranslations['en-US'];
        
        // Check for specific commands
        if (commands.hello.some(keyword => command.includes(keyword))) {
            handleHello(language);
        } else if (commands.start.some(keyword => command.includes(keyword))) {
            handleStart(language);
        } else if (commands.next.some(keyword => command.includes(keyword))) {
            handleNext(language);
        }
    }
    
    // Command handlers with language support
    function handleHello(language) {
        const responses = {
            'en-US': 'Hello! I heard you!',
            'es-ES': '¡Hola! ¡Te escuché!',
            'fr-FR': 'Bonjour! Je vous ai entendu!',
            'de-DE': 'Hallo! Ich habe dich gehört!',
            'it-IT': 'Ciao! Ti ho sentito!',
            'pt-BR': 'Olá! Eu ouvi você!',
            'zh-CN': '你好！我听到你了！',
            'ja-JP': 'こんにちは！聞こえました！',
            'ko-KR': '안녕하세요! 들었어요!',
            'ru-RU': 'Привет! Я вас слышу!',
            'ar-SA': 'مرحبا! سمعتك!'
        };
        
        statusElement.textContent = responses[language] || responses['en-US'];
        resultElement.textContent = `Command "${commandTranslations[language].hello[0]}" recognized`;
    }
    
    function handleStart(language) {
        const responses = {
            'en-US': 'Starting...',
            'es-ES': 'Comenzando...',
            'fr-FR': 'Démarrage...',
            'de-DE': 'Starten...',
            'it-IT': 'Avvio...',
            'pt-BR': 'Iniciando...',
            'zh-CN': '开始中...',
            'ja-JP': '開始中...',
            'ko-KR': '시작 중...',
            'ru-RU': 'Начинаем...',
            'ar-SA': 'جاري البدء...'
        };
        
        statusElement.textContent = responses[language] || responses['en-US'];
        resultElement.textContent = `Command "${commandTranslations[language].start[0]}" recognized`;
    }
    
    function handleNext(language) {
        const responses = {
            'en-US': 'Moving to next item...',
            'es-ES': 'Pasando al siguiente elemento...',
            'fr-FR': 'Passage à l\'élément suivant...',
            'de-DE': 'Zum nächsten Element...',
            'it-IT': 'Passando all\'elemento successivo...',
            'pt-BR': 'Movendo para o próximo item...',
            'zh-CN': '移动到下一项...',
            'ja-JP': '次の項目に移動...',
            'ko-KR': '다음 항목으로 이동...',
            'ru-RU': 'Переход к следующему элементу...',
            'ar-SA': 'الانتقال إلى العنصر التالي...'
        };
        
        statusElement.textContent = responses[language] || responses['en-US'];
        resultElement.textContent = `Command "${commandTranslations[language].next[0]}" recognized`;
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
        
        // Handle specific errors that should stop auto-restart
        if (event.error === 'not-allowed' || event.error === 'network') {
            console.log('Stopping auto-restart due to:', event.error);
            autoRestart = false;
            isListening = false;
            startBtn.textContent = 'Start Listening';
            animateVisualizer(false);
            
            // For network errors, provide a helpful message
            if (event.error === 'network') {
                statusElement.textContent = 'Network disconnected. Click "Start Listening" to try again when connected.';
            }
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
            // Clear visualizer
            visualizer.innerHTML = '';
        }
    }
    
    // Animate a single bar in the visualizer
    function animateBar(bar) {
        const height = Math.floor(Math.random() * 40) + 5; // Random height between 5-45px
        const duration = Math.floor(Math.random() * 300) + 200; // Random duration between 200-500ms
        
        // Animate up
        bar.style.transition = `height ${duration}ms ease-in-out`;
        bar.style.height = `${height}px`;
        
        // After animation completes, animate again if still active
        setTimeout(() => {
            if (visualizer.contains(bar)) {
                animateBar(bar);
            }
        }, duration);
    }
    
    // Initialize command list with default language
    updateCommandList(languageSelect.value);
});
