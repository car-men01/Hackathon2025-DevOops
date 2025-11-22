import React, { useState, useEffect } from 'react'; // Added useEffect
import { useNavigate, useSearchParams } from 'react-router-dom'; // Added useSearchParams
import { useGame } from '../../context/GameContext';
import type { UserRole, User, LobbyType } from '../../types';
import { gameService } from '../../services/gameService';
import { JimmyNarwhal } from '../../components/JimmyNarwhal';
import { INPUT_LIMITS } from '../../constants/settings';
import './Lobby.css';

export const Lobby: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); // Initialize search params hook
  const { setCurrentUser, setCurrentLobby } = useGame();
  
  const [name, setName] = useState('');
  const [lobbyCode, setLobbyCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // --- NEW CODE START ---
  // Check URL for PIN (QR Code Logic)
  useEffect(() => {
    const pinFromUrl = searchParams.get('pin'); // Checks for ?pin=XXXXXX
    
    if (pinFromUrl) {
      console.log('QR Code detected, joining lobby:', pinFromUrl);
      setIsJoining(true); // Switch UI to Join mode
      setLobbyCode(pinFromUrl.toUpperCase()); // Auto-fill the code
    }
  }, [searchParams]);
  // --- NEW CODE END ---

  const handleCreateLobby = async () => {
    console.log('Create Lobby');
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Note: We need concept, context, topic, and timeLimit
      // For now, use default/placeholder values - should be collected in a form
      const defaultConcept = 'Placeholder Concept';
      const defaultContext = 'Placeholder Context';
      const defaultTopic = 'Placeholder Topic';
      const defaultTimeLimit = 600; // 10 minutes in seconds

      console.log('[Lobby] Creating lobby on backend with:', {
        hostName: name.trim(),
        secretConcept: defaultConcept,
        context: defaultContext,
        topic: defaultTopic,
        timeLimit: defaultTimeLimit
      });

      const createResponse = await gameService.createLobby(
        name.trim(),
        defaultConcept,
        defaultContext,
        defaultTopic,
        defaultTimeLimit
      );

      console.log('[Lobby] Lobby created, response:', createResponse);

      const user: User = {
        id: createResponse.hostId,
        name: name.trim(),
        role: 'host' as UserRole,
        score: 0,
      };

      // Save to localStorage
      const userStorageData = {
        userId: user.id,
        userName: user.name,
        userType: 'host',
        lobbyCode: createResponse.pin,
        path: window.location.pathname,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('gameUserData', JSON.stringify(userStorageData));
      console.log('[Lobby] ✅ Host data saved to localStorage:', userStorageData);

      setCurrentUser(user);
      
      const lobby: LobbyType = {
        code: createResponse.pin,
        ownerId: createResponse.hostId,
        users: [user],
        status: 'waiting',
        questions: [],
        maxQuestions: 10,
      };
      
      setCurrentLobby(lobby);
      navigate('/host-setup');
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('[Lobby] Error creating lobby:', err);
        setError(err.message || 'Failed to create lobby');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinLobby = async () => {
    if (!name.trim() || !lobbyCode.trim()) {
      setError('Please enter your name and lobby code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await gameService.joinLobby(lobbyCode.toUpperCase(), name.trim());
      
      const user: User = {
        id: response.user_id,
        name: response.participant_name,
        role: 'participant' as UserRole,
        score: 0,
      };

      // Save to localStorage
      const userStorageData = {
        userId: user.id,
        userName: user.name,
        userType: 'participant',
        lobbyCode: response.pin,
        path: window.location.pathname,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('gameUserData', JSON.stringify(userStorageData));
      console.log('[Lobby] ✅ Participant data saved to localStorage:', userStorageData);

      const users = gameService.convertParticipantsToUsers(
        response.participants,
        response.host_name,
        user.id,
        user.name,
        false
      );

      const lobby: LobbyType = {
        code: response.pin,
        ownerId: 'host-id',
        users,
        status: 'waiting',
        questions: [],
        maxQuestions: 10,
      };

      setCurrentUser(user);
      setCurrentLobby(lobby);
      navigate('/waiting-room');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Failed to join lobby');
      }
    } finally {
      setIsLoading(false);
    }
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
          {error && <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
          
          <input
            type="text"
            placeholder={`Enter your name (max ${INPUT_LIMITS.NAME} chars)`}
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, INPUT_LIMITS.NAME))}
            className="lobby-input"
            disabled={isLoading}
            // Optional: Auto-focus on name if QR code was used
            autoFocus={isJoining} 
          />

          {isJoining && (
            <input
              type="text"
              placeholder={`Enter lobby code (max ${INPUT_LIMITS.LOBBY_CODE} chars)`}
              value={lobbyCode}
              onChange={(e) => setLobbyCode(e.target.value.toUpperCase().slice(0, INPUT_LIMITS.LOBBY_CODE))}
              className="lobby-input"
              maxLength={INPUT_LIMITS.LOBBY_CODE}
              disabled={isLoading}
              // If coming from QR code, we might want to make this read-only or just visually filled
            />
          )}

          <div className="lobby-actions">
            {!isJoining ? (
              <>
                <button onClick={handleCreateLobby} className="primary-button" disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Lobby'}
                </button>
                <button onClick={() => setIsJoining(true)} className="secondary-button" disabled={isLoading}>
                  Join Lobby
                </button>
              </>
            ) : (
              <>
                <button onClick={handleJoinLobby} className="primary-button" disabled={isLoading}>
                  {isLoading ? 'Joining...' : 'Join'}
                </button>
                <button onClick={() => setIsJoining(false)} className="secondary-button" disabled={isLoading}>
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