import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame, createMockLobby } from '../context/GameContext';
import type { UserRole } from '../types';
import { JimmyNarwhal } from '../components/JimmyNarwhal';
import './Lobby.css';

export const Lobby: React.FC = () => {
  const navigate = useNavigate();
  const { setCurrentUser, setCurrentLobby } = useGame();
  const [name, setName] = useState('');
  const [lobbyCode, setLobbyCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleCreateLobby = () => {
    if (!name.trim()) return;

    const user = {
      id: Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      role: 'teacher' as UserRole,
      score: 0,
    };

    const lobby = createMockLobby(user.id, 'teacher');
    setCurrentUser(user);
    setCurrentLobby(lobby);
    navigate('/host-setup');
  };

  const handleJoinLobby = () => {
    if (!name.trim() || !lobbyCode.trim()) return;

    const user = {
      id: Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      role: 'student' as UserRole,
      score: 0,
    };

    const lobby = createMockLobby('teacher-id', 'teacher');
    lobby.code = lobbyCode.toUpperCase();
    setCurrentUser(user);
    setCurrentLobby(lobby);
    navigate('/waiting-room');
  };

  return (
    <div className="lobby-page">
      <div className="lobby-container">
        <div className="lobby-header">
          <h1 className="lobby-title">Ask Jimmy</h1>
          <p className="lobby-subtitle">The Concept Detective</p>
        </div>

        <div className="lobby-mascot">
          <JimmyNarwhal state="idle" />
        </div>

        <div className="lobby-form">
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="lobby-input"
          />

          {isJoining && (
            <input
              type="text"
              placeholder="Enter lobby code"
              value={lobbyCode}
              onChange={(e) => setLobbyCode(e.target.value.toUpperCase())}
              className="lobby-input"
              maxLength={6}
            />
          )}

          <div className="lobby-actions">
            {!isJoining ? (
              <>
                <button onClick={handleCreateLobby} className="primary-button">
                  Create Lobby
                </button>
                <button onClick={() => setIsJoining(true)} className="secondary-button">
                  Join Lobby
                </button>
              </>
            ) : (
              <>
                <button onClick={handleJoinLobby} className="primary-button">
                  Join
                </button>
                <button onClick={() => setIsJoining(false)} className="secondary-button">
                  Back
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
