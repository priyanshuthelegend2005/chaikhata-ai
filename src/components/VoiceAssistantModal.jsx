import React, { useState, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  X, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Volume2, 
  Send,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { speechService } from '../services/speechService';
import { parseIntent } from '../services/intentParser';

export default function VoiceAssistantModal({ 
  isOpen, 
  onClose, 
  customers, 
  inventory, 
  settings, 
  onExecuteAction 
}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'listening' | 'processing' | 'success' | 'clarification' | 'error'
  const [feedback, setFeedback] = useState(null);
  const [recognizedIntent, setRecognizedIntent] = useState(null);

  // Sync mute setting
  useEffect(() => {
    speechService.setMuted(!settings.voiceEnabled);
    speechService.setLanguage(settings.voiceLanguage || 'hi-IN');
  }, [settings]);

  // When modal opens, auto-start listening if browser supported
  useEffect(() => {
    if (isOpen) {
      setTranscript('');
      setStatus('idle');
      setFeedback(null);
      setRecognizedIntent(null);
      
      // Auto-start listening after short delay for user ready
      const t = setTimeout(() => {
        handleStartListening();
      }, 350);
      return () => clearTimeout(t);
    } else {
      speechService.stopListening();
    }
  }, [isOpen]);

  const handleStartListening = () => {
    if (!speechService.isSupported()) {
      setStatus('error');
      setFeedback({
        title: 'Browser Not Supported',
        message: 'Aapka browser Speech Recognition support nahi karta. Niche text box me type karein.',
        type: 'error',
      });
      return;
    }

    setFeedback(null);
    setTranscript('');
    setStatus('listening');
    setIsListening(true);

    speechService.startListening({
      onStart: () => {
        setIsListening(true);
        setStatus('listening');
      },
      onInterim: (text) => {
        setTranscript(text);
      },
      onResult: (finalText) => {
        setIsListening(false);
        setTranscript(finalText);
        processCommand(finalText);
      },
      onError: (errMsg) => {
        setIsListening(false);
        setStatus('error');
        setFeedback({
          title: 'Aawaz Sunne me Samasya',
          message: errMsg,
          type: 'error',
        });
      },
      onEnd: () => {
        setIsListening(false);
      }
    });
  };

  const handleStopListening = () => {
    speechService.stopListening();
    setIsListening(false);
    if (status === 'listening') {
      setStatus('idle');
    }
  };

  const [lastExecution, setLastExecution] = useState({ text: '', timestamp: 0 });

  // Debounced command execution to prevent duplicate transactions
  const processCommand = (text) => {
    if (!text || !text.trim()) return;

    const trimmed = text.trim();
    const now = Date.now();

    // Prevent duplicate triggers of the exact same command within 2.5 seconds
    if (lastExecution.text === trimmed && (now - lastExecution.timestamp) < 2500) {
      return;
    }
    setLastExecution({ text: trimmed, timestamp: now });

    setStatus('processing');
    const intent = parseIntent(trimmed, { customers, inventory });
    setRecognizedIntent(intent);

    if (intent.type === 'UNKNOWN') {
      setStatus('error');
      setFeedback({
        title: 'Command Samajh Nahi Aaya',
        message: intent.message,
        type: 'error',
      });
      if (settings.voiceEnabled) {
        speechService.speak(intent.speechResponse);
      }
      return;
    }

    if (intent.type === 'CLARIFICATION_NEEDED') {
      setStatus('clarification');
      setFeedback({
        title: 'Aur Jankari Chahiye',
        message: intent.message,
        type: 'warning',
      });
      if (settings.voiceEnabled) {
        speechService.speak(intent.speechResponse);
      }
      return;
    }

    // Valid command execution
    try {
      const result = onExecuteAction(intent);
      setStatus('success');
      setFeedback({
        title: 'Operation Ho Gaya! ✅',
        message: intent.message,
        type: 'success',
      });

      if (settings.voiceEnabled) {
        speechService.speak(intent.speechResponse);
      }
    } catch (err) {
      console.error('Execution error:', err);
      setStatus('error');
      setFeedback({
        title: 'Error',
        message: err.message || 'Operation fail ho gaya',
        type: 'error',
      });
    }
  };

  const handleManualSubmit = (e) => {
    e?.preventDefault();
    if (!manualInput.trim()) return;
    setTranscript(manualInput);
    processCommand(manualInput);
    setManualInput('');
  };

  const samplePrompts = [
    "प्रियांशु के 100 रुपए उधार लिखो",
    "सुरेश ने 50 रुपये जमा कर दिए",
    "रमेश के 40 रुपये उधार लिख लो",
    "अमित का 50 रुपये उधार जोड़ दो",
    "दूध कितना बचा है?",
    "दूध के 5 पैकेट जोड़ दो",
    "चीनी 2 किलो कम कर दो",
    "कल के लिए 20 पैकेट दूध मंगा दो",
    "Ramesh ke 40 rupaye udhaar likh lo",
    "Suresh ne 50 rupaye jama kar diye",
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-chai-dark/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-orange-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xs">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight leading-tight">
                ChaiKhata AI Voice Assistant
              </h3>
              <p className="text-xs text-orange-100 font-medium">
                हिंदी व Hinglish स्मार्ट असिस्टेंट
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              speechService.stopListening();
              onClose();
            }}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col items-center justify-center text-center space-y-6">
          
          {/* Main Visual Microphone Circle */}
          <div className="relative flex items-center justify-center py-2">
            {isListening && (
              <>
                <div className="absolute w-36 h-36 rounded-full bg-orange-400/20 animate-ping"></div>
                <div className="absolute w-44 h-44 rounded-full bg-orange-500/15 animate-voice-ripple"></div>
              </>
            )}

            <button
              onClick={isListening ? handleStopListening : handleStartListening}
              className={`relative z-10 w-28 h-28 rounded-full flex flex-col items-center justify-center transition-all shadow-xl active:scale-95 ${
                isListening
                  ? 'bg-gradient-to-tr from-red-500 to-orange-500 text-white ring-8 ring-orange-200 shadow-orange-500/50'
                  : 'bg-gradient-to-tr from-orange-500 to-amber-500 text-white hover:shadow-orange-500/30'
              }`}
            >
              {isListening ? (
                <>
                  <Mic className="w-10 h-10 animate-pulse" />
                  <span className="text-[10px] font-bold mt-1 tracking-wider uppercase">Listening</span>
                </>
              ) : (
                <>
                  <Mic className="w-10 h-10" />
                  <span className="text-[10px] font-bold mt-1 tracking-wider uppercase">Tap to Speak</span>
                </>
              )}
            </button>
          </div>

          {/* Status Label */}
          <div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
              isListening
                ? 'bg-orange-100 text-orange-800 border border-orange-300'
                : status === 'success'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : status === 'clarification'
                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                : status === 'error'
                ? 'bg-red-100 text-red-800 border border-red-300'
                : 'bg-stone-100 text-stone-700'
            }`}>
              {isListening && '🎙️ ध्यान से सुन रहे हैं... बोलिए'}
              {status === 'processing' && '⚡ समझ रहे हैं और रिकॉर्ड कर रहे हैं...'}
              {status === 'success' && '✅ काम पूरा हो गया!'}
              {status === 'clarification' && '❓ थोड़ी और जानकारी चाहिए'}
              {status === 'error' && '⚠️ दुबारा बोलें या टाइप करें'}
              {status === 'idle' && !isListening && 'माइक्रोफ़ोन दबा कर बोलें'}
            </span>
          </div>

          {/* Live Transcript Bubble */}
          {(transcript || isListening) && (
            <div className="w-full bg-[#FFF9F2] border-2 border-orange-200/90 rounded-2xl p-4 shadow-inner text-left">
              <p className="text-[11px] font-bold text-orange-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Recognized Speech:</span>
                {settings.voiceEnabled && (
                  <span className="flex items-center space-x-1 text-stone-500 text-[10px]">
                    <Volume2 className="w-3 h-3 text-orange-600" />
                    <span>Hindi Voice Feedback</span>
                  </span>
                )}
              </p>
              <p className="text-base text-chai-dark font-semibold min-h-[1.75rem]">
                {transcript || <span className="text-stone-400 italic">बोलना शुरू करें...</span>}
              </p>
            </div>
          )}

          {/* Feedback Card */}
          {feedback && (
            <div className={`w-full rounded-2xl p-4 text-left border flex items-start space-x-3 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : feedback.type === 'warning'
                ? 'bg-amber-50 border-amber-300 text-amber-950'
                : 'bg-red-50 border-red-300 text-red-950'
            }`}>
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : feedback.type === 'warning' ? (
                <HelpCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <h4 className="font-bold text-sm">{feedback.title}</h4>
                <p className="text-xs mt-0.5 leading-relaxed font-medium">{feedback.message}</p>
              </div>
            </div>
          )}

          {/* Example Command Chips */}
          <div className="w-full text-left">
            <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
              Try saying or click to test (क्लिक करके टेस्ट करें):
            </p>
            <div className="flex flex-wrap gap-1.5">
              {samplePrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setTranscript(prompt);
                    processCommand(prompt);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-stone-50 hover:bg-orange-50 border border-stone-200 hover:border-orange-300 text-xs font-medium text-stone-700 hover:text-orange-900 transition flex items-center space-x-1"
                >
                  <span>"{prompt}"</span>
                  <ArrowRight className="w-3 h-3 text-stone-400" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer: Manual Input Fallback */}
        <div className="p-4 bg-stone-50 border-t border-chai-border">
          <form onSubmit={handleManualSubmit} className="flex items-center space-x-2">
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="यहाँ टाइप करें (उदा. Ramesh ke 40 rupaye likh lo)..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-chai-dark"
            />
            <button
              type="submit"
              disabled={!manualInput.trim()}
              className="px-4 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center space-x-1"
            >
              <span>भेजें</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
          <p className="text-[11px] text-stone-600 mt-2 text-center">
            Zero API Keys required • Local intent engine powered by Web Speech API
          </p>
        </div>
      </div>
    </div>
  );
}
