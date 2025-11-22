import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import './WaitingRoom.css';

export const WaitingRoom: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, currentLobby } = useGame();

  if (!currentUser || !currentLobby) {
    navigate('/');
    return null;
  }

  // Simulate game starting after some time (in a real app, this would be triggered by the host)
  React.useEffect(() => {
    if (currentLobby.status === 'playing') {
      navigate('/participant-game');
    }
  }, [currentLobby.status, navigate]);

  return (
    <div className="waiting-room-page">
      <div className="waiting-room-container">
        <h1>Lobby: {currentLobby.code}</h1>
        
        <div className="waiting-message">
          <div className="spinner"></div>
          <p>Waiting for the host to start the game...</p>
        </div>

        <div className="players-waiting-grid">
          <h2>Players in Lobby ({currentLobby.users.length})</h2>
          <div className="players-grid">
            {currentLobby.users.map((user, index) => (
              <div key={user.id} className="player-card-waiting">
                <div className="player-avatar-large">
                  {user.name[0].toUpperCase()}
                </div>
                <div className="player-info">
                  <span className="player-name-large">{user.name}</span>
                  <span className="player-number-badge">#{index + 1}</span>
                </div>
                {user.role === 'host' && <div className="host-indicator">👑 Host</div>}
              </div>
            ))}
          </div>
        </div>

        <button onClick={() => navigate('/')} className="leave-button">
          Leave Lobby
        </button>
      </div>
    </div>
  );
};
