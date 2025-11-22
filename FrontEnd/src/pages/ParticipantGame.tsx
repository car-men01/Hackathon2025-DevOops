import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import type { Question } from '../types';
import { JimmyNarwhal } from '../components/JimmyNarwhal';
import './ParticipantGame.css';

export const ParticipantGame: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, currentLobby, addQuestion, makeGuess } = useGame();
  const [questionText, setQuestionText] = useState('');
  const [guessText, setGuessText] = useState('');
  const [showGuessModal, setShowGuessModal] = useState(false);
  const [jimmyState, setJimmyState] = useState<'idle' | 'waiting' | 'processing' | 'correct' | 'incorrect'>('waiting');

  useEffect(() => {
    if (!currentUser || !currentLobby || currentLobby.status !== 'playing') {
      navigate('/');
    }
  }, [currentUser, currentLobby, navigate]);

  if (!currentUser || !currentLobby) {
    return null;
  }

  const myQuestions = currentLobby.questions.filter(q => q.userId === currentUser.id);
  const questionsRemaining = currentLobby.maxQuestions - myQuestions.length;

  const handleAskQuestion = () => {
    if (!questionText.trim() || questionsRemaining <= 0) return;

    setJimmyState('processing');

    // Simulate AI response
    setTimeout(() => {
      const answers: Array<'YES' | 'NO' | 'I_DONT_KNOW' | 'OUT_OF_CONTEXT'> = ['YES', 'NO', 'I_DONT_KNOW', 'OUT_OF_CONTEXT'];
      const randomAnswer = answers[Math.floor(Math.random() * answers.length)];

      const newQuestion: Question = {
        id: Math.random().toString(36).substr(2, 9),
        userId: currentUser.id,
        userName: currentUser.name,
        question: questionText.trim(),
        answer: randomAnswer,
        timestamp: Date.now(),
      };

      addQuestion(newQuestion);
      setQuestionText('');
      setJimmyState('waiting');
    }, 1500);
  };

  const handleGuess = () => {
    if (!guessText.trim()) return;

    const isCorrect = makeGuess(guessText);
    setJimmyState(isCorrect ? 'correct' : 'incorrect');

    setTimeout(() => {
      if (isCorrect) {
        navigate('/results');
      } else {
        setShowGuessModal(false);
        setGuessText('');
        setJimmyState('waiting');
      }
    }, 2000);
  };

  const getAnswerClass = (answer: string) => {
    if (answer === 'YES') return 'answer-yes';
    if (answer === 'NO') return 'answer-no';
    if (answer === 'I_DONT_KNOW') return 'answer-idk';
    if (answer === 'OUT_OF_CONTEXT') return 'answer-ooc';
    return 'answer-na';
  };

  const getAnswerIcon = (answer: string) => {
    if (answer === 'YES') return '✓';
    if (answer === 'NO') return '✗';
    if (answer === 'I_DONT_KNOW') return '?';
    if (answer === 'OUT_OF_CONTEXT') return '!';
    return '?';
  };

  const getAnswerText = (answer: string) => {
    if (answer === 'I_DONT_KNOW') return "I Don't Know";
    if (answer === 'OUT_OF_CONTEXT') return 'Out of Context';
    return answer;
  };

  return (
    <div className="participant-game-page">
      <div className="game-layout">
        {/* Left Column: Game State */}
        <div className="game-sidebar">
          <div className="game-logo">
            <h2>Ask Jimmy</h2>
          </div>

          <div className="questions-counter">
            <div className="counter-bubble">
              <span className="counter-number">{questionsRemaining}</span>
              <span className="counter-label">Questions Left</span>
            </div>
          </div>

          <div className="players-panel">
            <h3>Players</h3>
            <div className="players-list-compact">
              {currentLobby.users.filter(u => u.role === 'student').map((user, index) => (
                <div key={user.id} className="player-item-compact">
                  <div className="player-number">{index + 1}</div>
                  <span className="player-name-compact">{user.name}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setShowGuessModal(true)}
            className="guess-button"
            disabled={myQuestions.length === 0}
          >
            🎯 GUESS THE CONCEPT
          </button>
        </div>

        {/* Center Column: Deduction Log */}
        <div className="game-main">
          <div className="log-header">
            <h2>Jimmy's Discovery Log</h2>
            <p>All questions from students appear here</p>
          </div>

          <div className="deduction-log">
            {currentLobby.questions.length === 0 ? (
              <div className="empty-log">
                <p>No questions yet. Be the first to ask Jimmy!</p>
              </div>
            ) : (
              currentLobby.questions.map((q) => (
                <div key={q.id} className="log-entry">
                  <div className="question-bubble">
                    <div className="bubble-header">
                      <span className="question-author">{q.userName}</span>
                      <span className="question-time">
                        {new Date(q.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="question-text">{q.question}</p>
                  </div>
                  <div className={`answer-bubble ${getAnswerClass(q.answer)}`}>
                    <img src="/narwal_icon.png" alt="Jimmy" className="jimmy-avatar-small" />
                    <div className="answer-content-small">
                      <span className="answer-icon-small">{getAnswerIcon(q.answer)}</span>
                      <span className="answer-text">{getAnswerText(q.answer)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Actions */}
        <div className="game-actions">
          <div className="mascot-container">
            <JimmyNarwhal state={jimmyState} />
          </div>

          <div className="question-input-panel">
            <label htmlFor="question-input">Ask Jimmy a Question</label>
            <textarea
              id="question-input"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Type your yes/no question here..."
              className="question-input"
              rows={4}
              disabled={questionsRemaining <= 0}
            />
            <button
              onClick={handleAskQuestion}
              className="ask-button"
              disabled={!questionText.trim() || questionsRemaining <= 0 || jimmyState === 'processing'}
            >
              {jimmyState === 'processing' ? 'Jimmy is thinking...' : 'ASK JIMMY'}
            </button>
          </div>
        </div>
      </div>

      {/* Guess Modal */}
      {showGuessModal && (
        <div className="modal-overlay" onClick={() => setShowGuessModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Ready to Guess?</h2>
            <p>Think you know the secret concept? Type it below!</p>
            <input
              type="text"
              value={guessText}
              onChange={(e) => setGuessText(e.target.value)}
              placeholder="Enter your guess..."
              className="guess-input"
              autoFocus
            />
            <div className="modal-actions">
              <button onClick={handleGuess} className="modal-primary-button">
                Let's see! 🎯
              </button>
              <button onClick={() => setShowGuessModal(false)} className="modal-secondary-button">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
