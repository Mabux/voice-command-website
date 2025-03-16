# Voice Command Website

A simple website that listens for voice commands on load. Currently recognizes three commands: "hello", "start", and "next".

## Features

- Automatically starts listening for voice commands when the page loads
- Recognizes three basic commands: "hello", "start", and "next"
- Visual feedback when commands are recognized
- Simple audio visualization
- Manual control to start/stop listening
- Mobile-friendly design with specific guidance for mobile users

## How to Use

1. Open `index.html` in a modern web browser (**Chrome or Edge recommended**)
2. When prompted, allow microphone access
3. The website will automatically start listening for voice commands
4. Say one of the following commands:
   - "Hello" - Greets the website
   - "Start" - Begins an action
   - "Next" - Moves to the next item
5. The website will display the recognized command and perform the associated action

## Browser Compatibility

This website uses the Web Speech API, which has limited browser support:

- **Fully Supported**: Google Chrome, Microsoft Edge
- **Not Supported**: Firefox, Safari (desktop), and most other browsers

If you open the website in an unsupported browser, you'll see a compatibility warning with instructions to use a supported browser.

For more information about browser support for the Web Speech API, visit [Can I Use - Speech Recognition](https://caniuse.com/speech-recognition).

## Mobile Compatibility

The website is designed to work on mobile devices with the following considerations:

- **Android**: Works best in Chrome for Android
- **iOS**: Has limited support in Safari
- **Mobile-specific features**:
  - Automatic detection of mobile devices
  - Adjusted UI for touch interaction
  - Manual start required (tap the "Start Listening" button)
  - Helpful tips for better voice recognition on mobile

On mobile devices, the website will not automatically start listening to avoid permission issues and to conserve battery. Instead, you'll need to tap the "Start Listening" button to begin voice recognition.

## Running Locally

Simply open the `index.html` file in your web browser. No server is required.

## Extending the Website

To add more voice commands, modify the `processCommand` function in `script.js` and add new handler functions as needed.
