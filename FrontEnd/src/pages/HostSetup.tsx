import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { JimmyNarwhal } from '../components/JimmyNarwhal';
import './HostSetup.css';

export const HostSetup: React.FC = () => {
  const navigate = useNavigate();
  const { currentLobby, updateLobby } = useGame();
  const [concept, setConcept] = useState('');
  const [context, setContext] = useState('');

  const handleStartGame = () => {
    if (!concept.trim()) return;

    updateLobby({
      concept: concept.trim(),
      context: context.trim(),
      status: 'playing',
    });

    navigate('/host-game');
  };

  if (!currentLobby) {
    navigate('/');
    return null;
  }

  return (
    <div className="host-setup-page">
      <div className="host-setup-container">
        <div className="setup-header">
          <h1>Setup Your Game</h1>
          <p className="lobby-code">
            Lobby Code: <span>{currentLobby.code}</span>
          </p>
        </div>

        <div className="setup-mascot">
          <JimmyNarwhal state="waiting" />
        </div>

        <div className="setup-form">
          <div className="form-group">
            <label htmlFor="concept">Secret Concept *</label>
            <input
              id="concept"
              type="text"
              placeholder="e.g., Photosynthesis, French Revolution..."
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              className="setup-input"
            />
            <p className="input-hint">The word or concept students need to guess</p>
          </div>

          <div className="form-group">
            <label htmlFor="context">Optional Context</label>
            <textarea
              id="context"
              placeholder="Add clarifications or hints about the concept..."
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="setup-textarea"
              rows={4}
            />
            <p className="input-hint">Help Jimmy understand the context better</p>
          </div>

          <div className="players-waiting">
            <h3>Players in Lobby ({currentLobby.users.length})</h3>
            <div className="players-list">
              {currentLobby.users.map((user) => (
                <div key={user.id} className="player-card">
                  <div className="player-avatar">{user.name[0].toUpperCase()}</div>
                  <span className="player-name">{user.name}</span>
                  {user.role === 'teacher' && <span className="teacher-badge">Host</span>}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleStartGame}
            className="start-game-button"
            disabled={!concept.trim()}
          >
            Start Game
          </button>
        </div>
      </div>
    </div>
  );
};
