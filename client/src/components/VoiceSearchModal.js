import React, { useEffect, useRef, useState } from 'react';
import { FaMicrophone, FaTimes } from 'react-icons/fa';

/**
 * VoiceSearchModal — Uses Chrome's native Web Speech API (which internally
 * uses Google's speech recognition servers). Works on localhost in Chrome.
 * 
 * Root cause of "closes immediately": Chrome fires .onend immediately if:
 * 1. Mic permission is denied
 * 2. No audio is captured within ~7 seconds (Chrome's hard timeout)
 * 3. The recognition session is not restarted after interim results
 *
 * Fix: Listen only once and show the result, with a visible "Try again" button.
 */
function VoiceSearchModal({ onClose, onResult }) {
  const [status, setStatus] = useState('idle'); // idle | listening | got-result | error
  const [transcript, setTranscript] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const recognitionRef = useRef(null);
  const hasResultRef = useRef(false);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatus('error');
      setErrorMsg('Voice search is not supported in this browser. Please use Chrome.');
      return;
    }

    // Stop any previous session
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }

    hasResultRef.current = false;
    setTranscript('');
    setErrorMsg('');
    setStatus('listening');

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setStatus('listening');
    };

    recognition.onresult = (event) => {
      let interimText = '';
      let finalText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
        } else {
          interimText += result[0].transcript;
        }
      }

      if (finalText) {
        hasResultRef.current = true;
        setTranscript(finalText.trim());
        setStatus('got-result');
        // Pass result up and close after brief delay
        onResult(finalText.trim());
        setTimeout(onClose, 1000);
      } else if (interimText) {
        setTranscript(interimText);
      }
    };

    recognition.onerror = (event) => {
      hasResultRef.current = true; // prevent auto-close from onend
      setStatus('error');

      switch (event.error) {
        case 'not-allowed':
        case 'permission-denied':
          setErrorMsg('Microphone access denied. Please allow mic permissions in your browser settings and try again.');
          break;
        case 'no-speech':
          setErrorMsg("No speech detected. Make sure your microphone is working and try again.");
          break;
        case 'audio-capture':
          setErrorMsg('No microphone found. Please connect a microphone and try again.');
          break;
        case 'network':
          setErrorMsg('Network error. Please check your internet connection.');
          break;
        case 'aborted':
          setErrorMsg('Listening was cancelled. Click the mic to try again.');
          break;
        default:
          setErrorMsg(`Error: ${event.error}. Click the mic to try again.`);
      }
    };

    recognition.onend = () => {
      // If we ended without a result and no error, show retry prompt
      if (!hasResultRef.current && status !== 'error') {
        setStatus('error');
        setErrorMsg("Didn't catch that. Click the mic to try again.");
      }
    };

    try {
      recognition.start();
    } catch (e) {
      setStatus('error');
      setErrorMsg('Could not start listening. Please reload the page and try again.');
    }
  };

  // Auto-start on mount
  useEffect(() => {
    // Small delay to let modal animate in before requesting mic
    const timer = setTimeout(startListening, 300);
    return () => {
      clearTimeout(timer);
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isListening = status === 'listening';
  const hasResult = status === 'got-result';
  const isError = status === 'error';

  return (
    <div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        zIndex: 2000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--surface-color)',
          width: '600px', maxWidth: '92vw',
          borderRadius: '20px',
          padding: '48px 40px',
          position: 'relative',
          boxShadow: '0 32px 60px rgba(0,0,0,0.3)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px',
          animation: 'slideUp 0.3s ease-out'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '16px', right: '16px',
            background: 'none', border: 'none',
            cursor: 'pointer', padding: '8px', borderRadius: '50%',
            color: 'var(--text-secondary)', display: 'flex',
            transition: 'background 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <FaTimes size={18} />
        </button>

        {/* Status text */}
        <div style={{
          fontSize: isListening ? '22px' : '18px',
          color: isError ? 'var(--text-secondary)' : 'var(--text-primary)',
          textAlign: 'center',
          minHeight: '60px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: isListening ? '400' : '500',
          lineHeight: '1.5',
          padding: '0 16px'
        }}>
          {isListening && !transcript && 'Listening... Speak now'}
          {isListening && transcript && <em style={{ color: '#1a73e8' }}>{transcript}</em>}
          {hasResult && <span style={{ color: '#34a853' }}>✓ "{transcript}"</span>}
          {isError && errorMsg}
        </div>

        {/* Mic button */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={isError ? startListening : undefined}
            style={{
              width: '72px', height: '72px',
              borderRadius: '50%', border: 'none',
              backgroundColor: isError ? '#666' : hasResult ? '#34a853' : '#ea4335',
              color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: isError ? 'pointer' : 'default',
              boxShadow: isListening ? '0 0 0 0 rgba(234,67,53,0.4)' : 'none',
              animation: isListening ? 'micPulse 1.5s ease-out infinite' : 'none',
              transition: 'background-color 0.3s',
              flexShrink: 0
            }}
            title={isError ? 'Click to try again' : isListening ? 'Listening...' : ''}
          >
            <FaMicrophone size={30} />
          </button>

          {isError && (
            <span
              onClick={startListening}
              style={{ fontSize: '14px', color: '#1a73e8', cursor: 'pointer', fontWeight: '500' }}
            >
              Try again
            </span>
          )}

          {isListening && (
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Speak clearly into your microphone
            </span>
          )}
        </div>
      </div>

      <style>{`
        @keyframes micPulse {
          0%   { box-shadow: 0 0 0 0 rgba(234, 67, 53, 0.5); }
          70%  { box-shadow: 0 0 0 24px rgba(234, 67, 53, 0); }
          100% { box-shadow: 0 0 0 0 rgba(234, 67, 53, 0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(24px); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default VoiceSearchModal;
