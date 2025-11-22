import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { gameService } from '../../services';
import './WaitingRoom.css';

export const WaitingRoom: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, currentLobby, updateLobby } = useGame();

  // Poll for game start and participants updates
  useEffect(() => {
    if (!currentUser || !currentLobby) return;

    const pollInterval = setInterval(async () => {
      try {
        const lobbyInfo = await gameService.getLobbyInfo(currentLobby.code, currentUser.id);
        
        // Update participants list
        const users = gameService.convertParticipantsToUsers(
          lobbyInfo.participants,
          lobbyInfo.host_name,
          currentUser.id,
          currentUser.name,
          false
        );

        updateLobby({ users });

        // Check if game has started
        if (lobbyInfo.start_time) {
          updateLobby({ status: 'playing', start_time: lobbyInfo.start_time });
          navigate('/participant-game');
        }
      } catch (err) {
        console.error('Error polling lobby info:', err);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(pollInterval);
  }, [currentUser, currentLobby, navigate, updateLobby]);

  if (!currentUser || !currentLobby) {
    navigate('/');
    return null;
  }

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

        <button onClick={() => {
          console.log('[WaitingRoom] 🚪 Leaving lobby...');
          localStorage.removeItem('gameUserData');
          console.log('[WaitingRoom] ✅ LocalStorage cleared');
          navigate('/');
        }} className="end-game-button">
          Leave Lobby
        </button>
      </div>
    </div>
  );
};
