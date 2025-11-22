import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { gameService } from '../../services/gameService'; // Ensure path matches your export
import { JimmyNarwhal } from '../../components/JimmyNarwhal';
import type { LobbyType } from '../../types';
import { INPUT_LIMITS } from '../../constants/settings';
import './HostSetup.css';

export const HostSetup: React.FC = () => {
  console.log('[HostSetup] ========== COMPONENT RENDER ==========');
  const navigate = useNavigate();
  const { currentUser, setCurrentUser, currentLobby, updateLobby, setCurrentLobby } = useGame();
  
  // Form State
  const [concept, setConcept] = useState('');
  const [context, setContext] = useState('');
  const [topic, setTopic] = useState('');
  const [timeLimit, setTimeLimit] = useState('10');
  
  // UI State
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lobbyCreated, setLobbyCreated] = useState(false);
  const [showLobbyView, setShowLobbyView] = useState(false);
  
  // NEW: QR Code State
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

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
    if (!currentLobby || !currentUser || !lobbyCreated) {
      return;
    }

    const pollInterval = setInterval(async () => {
      try {
        const lobbyInfo = await gameService.getLobbyInfo(currentLobby.code, currentUser.id);
        
        const users = gameService.convertParticipantsToUsers(
          lobbyInfo.participants,
          lobbyInfo.host_name,
          currentUser.id,
          currentUser.name,
          true
        );

        updateLobby({ 
          users,
          ...(lobbyInfo.topic && { topic: lobbyInfo.topic })
        });
      } catch (err) {
        console.error('[HostSetup] Error polling lobby info:', err);
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [currentLobby, currentUser, lobbyCreated, updateLobby]);

 const handleProceedToLobby = async () => {
    if (!concept.trim() || !topic.trim() || !context.trim() || !timeLimit || !currentUser) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('[HostSetup] Creating lobby on backend...');
      const createResponse = await gameService.createLobby(
        currentUser.name,
        concept.trim(),
        context.trim(),
        topic.trim(),
        parseInt(timeLimit) * 60
      );

      // ============================================================
      // 🔴 CRITICAL FIX START: Update the Current User with the Real Host ID
      // ============================================================
      
      // 1. Create the updated user object using the ID returned by the backend
      const updatedUser = { 
        ...currentUser, 
        id: createResponse.hostId // This is the ID the backend expects
      };

      // 2. Update Global State
      setCurrentUser(updatedUser);

      // 3. Update Local Storage (so refreshing doesn't break the game)
      const storedData = localStorage.getItem('gameUserData');
      if (storedData) {
        const parsed = JSON.parse(storedData);
        parsed.userId = createResponse.hostId;
        parsed.lobbyCode = createResponse.pin;
        localStorage.setItem('gameUserData', JSON.stringify(parsed));
      }
      // ============================================================
      // 🔴 CRITICAL FIX END
      // ============================================================

      // --- QR CODE GENERATION ---
      try {
        const origin = window.location.origin; 
        const joinLink = `${origin}/?pin=${createResponse.pin}`;

        const qrData = await gameService.generateQRCode(joinLink);
        setQrCodeUrl(qrData);
      } catch (qrErr) {
        console.error('Failed to generate QR code', qrErr);

        // Don't block the flow if QR fails
      }
      // -------------------------------

      const newLobby: LobbyType = {
        code: createResponse.pin,
        ownerId: createResponse.hostId,
        // Use updatedUser here to ensure consistency
        users: [{ ...updatedUser, role: 'host' }], 

        status: 'waiting',
        questions: [],
        maxQuestions: 10,
        concept: concept.trim(),
        context: context.trim(),
        topic: topic.trim(),
        timeLimit: parseInt(timeLimit) * 60,
      };

      setCurrentLobby(newLobby);
      setLobbyCreated(true);
      setShowLobbyView(true);
    } catch (err: unknown) {
      console.error('[HostSetup] Error creating lobby:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create lobby';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToFields = () => {
    setShowLobbyView(false);
  };

  const handleStartGame = async () => {
    if (!currentLobby || !currentUser || currentLobby.code === 'TEMP') {
      setError('Please create lobby first');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await gameService.startLobby(
        currentLobby.code, 
        currentUser.id,
        concept.trim(),
        context.trim(),
        topic.trim(),
        parseInt(timeLimit) * 60
      );
      
      updateLobby({ 
        status: 'playing',
        concept: concept.trim(),
        context: context.trim(),
        topic: topic.trim(),
        timeLimit: parseInt(timeLimit) * 60,
      });
      navigate('/host-game');
    } catch (err: unknown) {
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
          {showLobbyView && (
            <p className="lobby-code">
              Lobby Code: <span>{currentLobby.code}</span>
            </p>
          )}
        </div>

        <div className="setup-mascot">
          <JimmyNarwhal state="waiting" />
        </div>

        {!showLobbyView ? (
          /* Fields View */
          <div className="setup-form">
            {error && <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
            
            <div className="form-group">
              <label htmlFor="topic">Topic/Description *</label>
              <input
                id="topic"
                type="text"
                placeholder={`e.g., Biology (max ${INPUT_LIMITS.TOPIC} chars)`}
                value={topic}
                onChange={(e) => setTopic(e.target.value.slice(0, INPUT_LIMITS.TOPIC))}
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
                placeholder={`e.g., Photosynthesis (max ${INPUT_LIMITS.CONCEPT} chars)`}
                value={concept}
                onChange={(e) => setConcept(e.target.value.slice(0, INPUT_LIMITS.CONCEPT))}
                className="setup-input"
                disabled={isLoading}
              />
              <p className="input-hint">The word or concept participants need to guess</p>
            </div>

            <div className="form-group">
              <label htmlFor="context">Context/Clarification *</label>
              <textarea
                id="context"
                placeholder={`Add clarifications or hints... (max ${INPUT_LIMITS.CONTEXT} chars)`}
                value={context}
                onChange={(e) => setContext(e.target.value.slice(0, INPUT_LIMITS.CONTEXT))}
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
                onChange={(e) => setTimeLimit(e.target.value.slice(0, INPUT_LIMITS.TIME_LIMIT))}
                className="setup-input"
                disabled={isLoading}
              />
              <p className="input-hint">Time limit for the game in minutes</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
              onClick={handleProceedToLobby}
              className="proceed-button"
              disabled={!concept.trim() || !topic.trim() || !context.trim() || !timeLimit || isLoading}
            >
              {isLoading ? 'Creating Lobby...' : 'Proceed to Lobby'}
            </button>
          </div>
        ) : (
          /* Lobby View */
          <div className="lobby-view">
            
            {/* --- MODIFIED QR SECTION --- */}
            <div className="qr-code-placeholder">
              {qrCodeUrl ? (
                <img 
                  src={qrCodeUrl} 
                  alt="Scan to join" 
                  className="qr-code-image"
                />
              ) : (
                <>
                  <p>Loading QR Code...</p>
                  <div className="spinner"></div>
                </>
              )}
            </div>
            <p className="scan-hint">Scan with your phone to join automatically!</p>
            {/* --------------------------- */}
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

            {error && <div className="error-message">{error}</div>}


            <button
              onClick={handleStartGame}
              className="start-game-button"
              disabled={isLoading}
            >
              {isLoading ? 'Starting...' : 'Start Game'}
            </button>

            <div className="bottom-buttons">
              <button onClick={handleBackToFields} className="back-button">
                Back
              </button>
              <button onClick={handleLeaveLobby} className="leave-lobby-button">
                Leave Lobby
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};