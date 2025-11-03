import React, { useState, useEffect } from 'react';
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import Button from '../Button';
import './SpeechToText.css';

const SpeechToText = ({ onTranscript, disabled = false }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const { user } = useSelector((state) => state?.authReducer);

  // Browser ke built-in Speech Recognition API use karo
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in your browser. Please use Chrome.');
      return;
    }

    setIsListening(true);
    setTranscript('');
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = user?.preferences?.language || 'en-US';

    recognition.onresult = (event) => {
      const currentTranscript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      setTranscript(currentTranscript);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (transcript && onTranscript) {
        onTranscript(transcript);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.start();
  };

  const stopListening = () => {
    setIsListening(false);
    // Recognition automatically stops when isListening changes
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="speech-to-text">
      <Button
        onClick={toggleListening}
        disabled={disabled}
        className={`mic-button ${isListening ? 'listening' : ''}`}
      >
        {isListening ? (
          <FaMicrophoneSlash className="mic-icon" />
        ) : (
          <FaMicrophone className="mic-icon" />
        )}
        {isListening ? 'Stop Listening' : 'Start Voice Input'}
      </Button>
      
      {isListening && (
        <div className="listening-indicator">
          <div className="pulse"></div>
          <span>Listening...</span>
        </div>
      )}
      
      {transcript && (
        <div className="transcript">
          <strong>You said:</strong> {transcript}
        </div>
      )}
    </div>
  );
};

export default SpeechToText;