import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { gameService } from '../../services';
import { JimmyNarwhal } from '../../components/JimmyNarwhal';
import type { LobbyType } from '../../types';
import './HostSetup.css';

export const HostSetup: React.FC = () => {
  console.log('[HostSetup] ========== COMPONENT RENDER ==========');
  const navigate = useNavigate();
  const { currentUser, currentLobby, updateLobby, setCurrentLobby } = useGame();
  const [concept, setConcept] = useState('');
  const [context, setContext] = useState('');
  const [topic, setTopic] = useState('');
  const [timeLimit, setTimeLimit] = useState('10');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lobbyCreated, setLobbyCreated] = useState(false);

  // Debug: Log current lobby state
  useEffect(() => {
    console.log('[HostSetup] Current lobby state:', {
      code: currentLobby?.code,
      ownerId: currentLobby?.ownerId,
      usersCount: currentLobby?.users?.length,
      lobbyCreated,
      currentUserId: currentUser?.id,
      currentUserName: currentUser?.name
    });
  }, [currentLobby, currentUser, lobbyCreated]);

  // Poll for participants joining
  useEffect(() => {
    if (!currentLobby || !currentUser || lobbyCreated) {
      console.log('[HostSetup] Skipping poll:', {
        hasLobby: !!currentLobby,
        hasUser: !!currentUser,
        code: currentLobby?.code,
        lobbyCreated
      });
      return;
    }

    console.log('[HostSetup] Starting participant polling for lobby:', currentLobby.code);

    const pollInterval = setInterval(async () => {
      try {
        console.log('[HostSetup] Polling lobby info for:', currentLobby.code);
        const lobbyInfo = await gameService.getLobbyInfo(currentLobby.code, currentUser.id);
        console.log('[HostSetup] Received lobby info:', lobbyInfo);
        
        const users = gameService.convertParticipantsToUsers(
          lobbyInfo.participants,
          lobbyInfo.host_name,
          currentUser.id,
          currentUser.name,
          true
        );
        console.log('[HostSetup] Converted users:', users);

        updateLobby({ 
          users,
          ...(lobbyInfo.topic && { topic: lobbyInfo.topic })
        });
      } catch (err) {
        console.error('[HostSetup] Error polling lobby info:', err);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(pollInterval);
  }, [currentLobby, currentUser, lobbyCreated, updateLobby]);

  const handleStartGame = async () => {
    console.log('[HostSetup] handleStartGame called - START');
    console.log('[HostSetup] Validation check:', {
      concept: concept.trim(),
      topic: topic.trim(),
      hasLobby: !!currentLobby,
      hasUser: !!currentUser,
      lobbyCode: currentLobby?.code
    });

    if (!concept.trim() || !topic.trim() || !currentLobby || !currentUser) {
      console.log('[HostSetup] Validation failed, returning early');
      return;
    }

    console.log('[HostSetup] handleStartGame validation passed, proceeding...');

    console.log('[HostSetup] Setting isLoading to true');
    setIsLoading(true);
    setError('');

    try {
      console.log('[HostSetup] Checking lobby code:', currentLobby.code);
      // If lobby not yet created on backend, create it first
      if (currentLobby.code === 'TEMP') {
        console.log('[HostSetup] Creating lobby on backend...');
        console.log('[HostSetup] Calling gameService.createLobby with:', {
          hostName: currentUser.name,
          secretConcept: concept.trim(),
          context: context.trim(),
          topic: topic.trim(),
          timeLimit: parseInt(timeLimit) * 60
        });
        
        const createResponse = await gameService.createLobby(
          currentUser.name,
          concept.trim(),
          context.trim(),
          topic.trim(),
          parseInt(timeLimit) * 60
        );
        console.log('[HostSetup] Lobby created, response:', createResponse);

        const newLobby: LobbyType = {
          code: createResponse.pin,
          ownerId: createResponse.hostId,
          users: [{ ...currentUser, id: createResponse.hostId }],
          status: 'waiting',
          questions: [],
          maxQuestions: 10,
          concept: concept.trim(),
          context: context.trim(),
          topic: topic.trim(),
          timeLimit: parseInt(timeLimit) * 60,
        };

        console.log('[HostSetup] Setting new lobby:', newLobby);
        setCurrentLobby(newLobby);
        setLobbyCreated(true);
        console.log('[HostSetup] Lobby created flag set to true');
        
        // Wait a moment for state to update
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Now start the lobby
        console.log('[HostSetup] Starting lobby:', createResponse.pin);
        await gameService.startLobby(createResponse.pin, createResponse.hostId);
        console.log('[HostSetup] Lobby started successfully');
        
        // Navigate immediately after starting (no need to wait for state update)
        navigate(`/host/game/${currentLobby.code}`);
        console.log('[HostSetup] Navigating to host-game');
        navigate('/host-game');
      } else {
        // Lobby already exists, just start it
        console.log('[HostSetup] Lobby already exists, starting:', currentLobby.code);
        await gameService.startLobby(
          currentLobby.code, 
          currentUser.id,
          concept.trim(),
          context.trim(),
          topic.trim(),
          parseInt(timeLimit) * 60
        );
        console.log('[HostSetup] Lobby started successfully');
        
        updateLobby({ 
          status: 'playing',
          concept: concept.trim(),
          context: context.trim(),
          topic: topic.trim(),
          timeLimit: parseInt(timeLimit) * 60,
        });
        console.log('[HostSetup] Navigating to host-game');
        navigate('/host-game');
      }
    } catch (err: unknown) {
      console.error('[HostSetup] Error in handleStartGame:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to start game';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveLobby = async () => {
    console.log('[HostSetup] 🚪 Leaving lobby...');
    try {
      if (currentLobby && currentUser) {
        console.log('[HostSetup] Deleting lobby:', currentLobby.code);
        await gameService.deleteLobby(currentLobby.code, currentUser.id);
        console.log('[HostSetup] Lobby deleted successfully');
      }
    } catch (error) {
      console.error('[HostSetup] Error deleting lobby:', error);
    }
    localStorage.removeItem('gameUserData');
    console.log('[HostSetup] ✅ LocalStorage cleared');
    navigate('/');
  };

  if (!currentLobby || !currentUser) {
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
          <button onClick={handleLeaveLobby} className="end-game-button">
            Leave Lobby
          </button>
        </div>

        <div className="setup-mascot">
          <JimmyNarwhal state="waiting" />
        </div>

        <div className="setup-form">
          {error && <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
          
          <div className="form-group">
            <label htmlFor="topic">Topic/Description *</label>
            <input
              id="topic"
              type="text"
              placeholder="e.g., The process by which plants convert sunlight into energy"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="setup-input"
              disabled={isLoading}
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
              disabled={isLoading}
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
              disabled={isLoading}
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
              disabled={isLoading}
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
            onClick={() => {
              console.log('[HostSetup] Start Game button clicked!');
              handleStartGame();
            }}
            className="start-game-button"
            disabled={!concept.trim() || !topic.trim() || !context.trim() || !timeLimit || isLoading}
          >
            {isLoading ? 'Starting...' : 'Start Game'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Add component-level logging
console.log('[HostSetup] Component module loaded');
