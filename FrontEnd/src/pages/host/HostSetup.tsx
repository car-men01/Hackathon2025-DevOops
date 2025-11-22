import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { JimmyNarwhal } from '../../components/JimmyNarwhal';
import './HostSetup.css';

export const HostSetup: React.FC = () => {
  const navigate = useNavigate();
  const { currentLobby, updateLobby } = useGame();
  const [concept, setConcept] = useState('');
  const [context, setContext] = useState('');
  const [topic, setTopic] = useState('');
  const [timeLimit, setTimeLimit] = useState('10');

  const handleStartGame = () => {
    if (!concept.trim() || !topic.trim() || !currentLobby) return;

    const updatedLobby = {
      concept: concept.trim(),
      context: context.trim(),
      timeLimit: parseInt(timeLimit) * 60,
      status: 'playing' as const,
    };

    updateLobby(updatedLobby);
    
    // Save to localStorage for participants to access
    const lobbyData = {
      ...currentLobby,
      ...updatedLobby,
    };
    localStorage.setItem(`lobby_${currentLobby.code}`, JSON.stringify(lobbyData));

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
            <label htmlFor="topic">Topic/Description *</label>
            <input
              id="topic"
              type="text"
              placeholder="e.g., The process by which plants convert sunlight into energy"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="setup-input"
            />
            <p className="input-hint">The description participants will see</p>
          </div>

          <div className="form-group">
            <label htmlFor="concept">Secret Word *</label>
            <input
              id="concept"
              type="text"
              placeholder="e.g., Photosynthesis, French Revolution..."
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              className="setup-input"
            />
            <p className="input-hint">The word or concept participants need to guess</p>
          </div>

          <div className="form-group">
            <label htmlFor="context">Context/Clarification *</label>
            <textarea
              id="context"
              placeholder="Add clarifications or hints..."
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="setup-textarea"
              rows={3}
            />
            <p className="input-hint">Additional context for the game</p>
          </div>

          <div className="form-group">
            <label htmlFor="timeLimit">Available Time (minutes) *</label>
            <input
              id="timeLimit"
              type="number"
              min="1"
              max="60"
              placeholder="10"
              value={timeLimit}
              onChange={(e) => setTimeLimit(e.target.value)}
              className="setup-input"
            />
            <p className="input-hint">Time limit for the game in minutes</p>
          </div>

          <div className="players-waiting">
            <h3>Players in Lobby ({currentLobby.users.length})</h3>
            <div className="players-list">
              {currentLobby.users.map((user) => (
                <div key={user.id} className="player-card">
                  <div className="player-avatar">{user.name[0].toUpperCase()}</div>
                  <span className="player-name">{user.name}</span>
                  {user.role === 'host' && <span className="teacher-badge">Host</span>}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleStartGame}
            className="start-game-button"
            disabled={!concept.trim() || !topic.trim() || !context.trim() || !timeLimit}
          >
            Start Game
          </button>
        </div>
      </div>
    </div>
  );
};
