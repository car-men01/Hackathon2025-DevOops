import React from 'react';
import './JimmyNarwhal.css';

interface JimmyNarwhalProps {
  state: 'idle' | 'waiting' | 'processing' | 'correct' | 'incorrect';
}

export const JimmyNarwhal: React.FC<JimmyNarwhalProps> = ({ state }) => {
  return (
    <div className={`jimmy-container jimmy-${state}`}>
      <img 
        src="/narwal_icon.png" 
        alt="Jimmy the Narwhal" 
        className="jimmy-image"
      />
      
      {state === 'idle' && <p className="jimmy-text">Hi! I'm Jimmy! 🌊</p>}
      {state === 'waiting' && <p className="jimmy-text">Ask me anything!</p>}
      {state === 'processing' && <p className="jimmy-text">Thinking...</p>}
      {state === 'correct' && <p className="jimmy-text">Woohoo! 🎉</p>}
      {state === 'incorrect' && <p className="jimmy-text">Try again!</p>}
      
      {/* Bubbles for correct answer */}
      {state === 'correct' && (
        <div className="bubbles-container">
          <div className="bubble bubble-1"></div>
          <div className="bubble bubble-2"></div>
          <div className="bubble bubble-3"></div>
        </div>
      )}
    </div>
  );
};
