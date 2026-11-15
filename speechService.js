/**
 * ChaiKhata AI - Web Speech API Integration
 * Handles SpeechRecognition (Hindi / Hinglish speech-to-text)
 * and SpeechSynthesis (Natural Hindi voice responses)
 */

class SpeechService {
  constructor() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.hasRecognitionSupport = Boolean(SpeechRecognition);
    this.recognition = this.hasRecognitionSupport ? new SpeechRecognition() : null;
    
    if (this.recognition) {
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'hi-IN';
      this.recognition.maxAlternatives = 1;
    }

    this.isListening = false;
    this.isSpeaking = false;
    this.isMuted = false;
    this.synth = window.speechSynthesis || null;
    this.cachedVoices = [];

    if (this.synth) {
      this.synth.onvoiceschanged = () => {
        this.cachedVoices = this.synth.getVoices();
      };
      this.cachedVoices = this.synth.getVoices();
    }
  }

  isSupported() {
    return this.hasRecognitionSupport;
  }

  setMuted(muted) {
    this.isMuted = Boolean(muted);
    if (this.isMuted && this.synth) {
      this.synth.cancel();
    }
  }

  setLanguage(lang = 'hi-IN') {
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }

  /**
   * Starts listening to microphone.
   * Calls onInterim with intermediate transcription,
   * onResult with final text,
   * and onError on issues.
   */
  startListening({ onStart, onInterim, onResult, onError, onEnd }) {
    if (!this.hasRecognitionSupport) {
      if (onError) onError('Aapka browser Speech Recognition support nahi karta. Manual input use karein.');
      return;
    }

    if (this.isListening) {
      this.stopListening();
    }

    // Cancel any active speech when listening starts
    if (this.synth) {
      this.synth.cancel();
    }

    this.recognition.onstart = () => {
      this.isListening = true;
      if (onStart) onStart();
    };

    this.recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (interimTranscript && onInterim) {
        onInterim(interimTranscript);
      }

      if (finalTranscript && onResult) {
        this.isListening = false;
        onResult(finalTranscript.trim());
      }
    };

    this.recognition.onerror = (event) => {
      this.isListening = false;
      let msg = 'Voice recognition error';
      if (event.error === 'not-allowed') {
        msg = 'Microphone permission denied. Kripya microphone allow karein.';
      } else if (event.error === 'no-speech') {
        msg = 'Koi aawaz sunai nahi di. Kripya dobara bolein.';
      } else if (event.error === 'network') {
        msg = 'Voice network error. Kripya internet ya browser check karein.';
      } else {
        msg = `Voice recognition: ${event.error}`;
      }
      if (onError) onError(msg);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (onEnd) onEnd();
    };

    try {
      this.recognition.start();
    } catch (err) {
      this.isListening = false;
      console.warn('Speech recognition start failed:', err);
      if (onError) onError('Microphone shuru nahi ho saka.');
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
      this.isListening = false;
    }
  }

  /**
   * Speaks Hindi/Hinglish text response with speech synthesis.
   */
  speak(text, onComplete) {
    if (!this.synth || this.isMuted || !text) {
      if (onComplete) onComplete();
      return;
    }

    try {
      this.synth.cancel(); // Stop any pending speech

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95; // Slightly slower for clarity
      utterance.pitch = 1.0;

      // Find best Hindi voice or Indian English
      const voices = this.cachedVoices.length ? this.cachedVoices : this.synth.getVoices();
      
      const hindiVoice = voices.find(v => v.lang.startsWith('hi') || v.lang === 'hi-IN') ||
                         voices.find(v => v.lang === 'en-IN') ||
                         voices.find(v => v.name.toLowerCase().includes('india') || v.name.toLowerCase().includes('hindi')) ||
                         voices[0];

      if (hindiVoice) {
        utterance.voice = hindiVoice;
        utterance.lang = hindiVoice.lang || 'hi-IN';
      } else {
        utterance.lang = 'hi-IN';
      }

      utterance.onstart = () => {
        this.isSpeaking = true;
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        if (onComplete) onComplete();
      };

      utterance.onerror = (e) => {
        this.isSpeaking = false;
        console.warn('Speech synthesis error:', e);
        if (onComplete) onComplete();
      };

      this.synth.speak(utterance);
    } catch (err) {
      this.isSpeaking = false;
      console.warn('Speech speak exception:', err);
      if (onComplete) onComplete();
    }
  }
}

export const speechService = new SpeechService();
