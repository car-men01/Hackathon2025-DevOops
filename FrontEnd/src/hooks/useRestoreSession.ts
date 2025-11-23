import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGame } from './useGame';
import { gameService } from '../services';
import type { User, LobbyType, UserRole, Question } from '../types';

interface StoredUserData {
  userId: string;
  userName: string;
  userType: 'host' | 'participant';
  lobbyCode: string;
  path: string;
  timestamp: string;
}

/**
 * Hook to restore user session from localStorage and navigate to the correct page.
 * Also polls for lobby information to keep the state synchronized.
 */
export const useRestoreSession = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, currentLobby, setCurrentUser, setCurrentLobby, updateLobby } = useGame();
  const isRestoringRef = useRef(false);
  const pollIntervalRef = useRef<number | null>(null);

  // Refs to hold latest state for polling
  const currentUserRef = useRef(currentUser);
  const currentLobbyRef = useRef(currentLobby);

  // Update refs when state changes
  useEffect(() => {
    currentUserRef.current = currentUser;
    currentLobbyRef.current = currentLobby;
  }, [currentUser, currentLobby]);

  useEffect(() => {
    const restoreSession = async () => {
      // If not on home page and no user/lobby, redirect to home
      if (location.pathname !== '/' && !currentUser && !currentLobby) {
        console.log('[useRestoreSession] 🏠 No session found, redirecting to home from:', location.pathname);
        navigate('/');
        return;
      }

      // Skip if already restoring or if user/lobby already exist
      if (isRestoringRef.current || currentUser || currentLobby) {
        console.log('[useRestoreSession] Skipping restore:', {
          isRestoring: isRestoringRef.current,
          hasUser: !!currentUser,
          hasLobby: !!currentLobby
        });
        return;
      }

      // Try to get stored data
      const storedDataStr = localStorage.getItem('gameUserData');
      if (!storedDataStr) {
        console.log('[useRestoreSession] No stored data found');
        return;
      }

      try {
        isRestoringRef.current = true;
        const storedData: StoredUserData = JSON.parse(storedDataStr);
        console.log('[useRestoreSession] 📦 Found stored data:', storedData);

        // Validate stored data
        if (!storedData.userId || !storedData.lobbyCode || !storedData.userType) {
          console.warn('[useRestoreSession] Invalid stored data, clearing...');
          localStorage.removeItem('gameUserData');
          return;
        }

        // Check if data is too old (more than 24 hours)
        const timestamp = new Date(storedData.timestamp);
        const now = new Date();
        const hoursSinceStorage = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);
        
        if (hoursSinceStorage > 24) {
          console.log('[useRestoreSession] ⏰ Stored data is too old, clearing...');
          localStorage.removeItem('gameUserData');
          return;
        }

        console.log('[useRestoreSession] 🔄 Attempting to restore session...');

        // Fetch current lobby info from backend
        const lobbyInfo = await gameService.getLobbyInfo(storedData.lobbyCode, storedData.userId);
        console.log('[useRestoreSession] ✅ Lobby info retrieved:', lobbyInfo);

        // Recreate user object
        const user: User = {
          id: storedData.userId,
          name: storedData.userName,
          role: storedData.userType as UserRole,
          score: 0,
        };

        // Convert participants to users
        const users = gameService.convertParticipantsToUsers(
          lobbyInfo.participants,
          lobbyInfo.host_name,
          user.id,
          user.name,
          storedData.userType === 'host'
        );

        // Recreate lobby object
        const lobby: LobbyType = {
          code: storedData.lobbyCode,
          ownerId: storedData.userType === 'host' ? storedData.userId : 'host-id',
          users,
          status: lobbyInfo.start_time ? 'playing' : 'waiting',
          questions: [],
          maxQuestions: 10,
          concept: lobbyInfo.secret_concept,
          context: lobbyInfo.context,
          topic: lobbyInfo.topic,
          timeLimit: lobbyInfo.timelimit,
          start_time: lobbyInfo.start_time,
        };

        console.log('[useRestoreSession] 👤 Restored user:', user);
        console.log('[useRestoreSession] 🏠 Restored lobby:', lobby);

        // Update context
        setCurrentUser(user);
        setCurrentLobby(lobby);

        // Determine correct page based on user type and lobby status
        let targetPath = '/';
        
        if (storedData.userType === 'host') {
          if (lobby.status === 'playing') {
            targetPath = '/host-game';
          } else if (lobby.status === 'waiting') {
            targetPath = '/host-setup';
          }
        } else {
          if (lobby.status === 'playing') {
            targetPath = '/participant-game';
          } else if (lobby.status === 'waiting') {
            targetPath = '/waiting-room';
          }
        }

        console.log('[useRestoreSession] 🧭 Current path:', location.pathname);
        console.log('[useRestoreSession] 🎯 Target path:', targetPath);

        // Navigate to the correct page
        if (location.pathname !== targetPath) {
          console.log('[useRestoreSession] 🚀 Navigating to:', targetPath);
          navigate(targetPath);
        }

        console.log('[useRestoreSession] ✨ Session restored successfully!');

      } catch (error) {
        console.error('[useRestoreSession] ❌ Error restoring session:', error);
        console.log('[useRestoreSession] 🧹 Clearing invalid stored data...');
        localStorage.removeItem('gameUserData');
        // Redirect to home on error
        if (location.pathname !== '/') {
          navigate('/');
        }
      } finally {
        isRestoringRef.current = false;
      }
    };

    // Try to restore session on any page load
    restoreSession();
  }, [location.pathname]); // Only depend on pathname

  // Polling effect - runs when user and lobby are set
  useEffect(() => {
    const hasSession = !!currentUser && !!currentLobby;
    
    if (!hasSession) {
      console.log('[useRestoreSession] Skipping poll setup - no user or lobby');
      if (pollIntervalRef.current) {
        console.log('[useRestoreSession] 🛑 Stopping lobby polling');
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      return;
    }

    // If already polling, do nothing (this prevents restart on updates)
    if (pollIntervalRef.current) {
      return;
    }

    console.log('[useRestoreSession] 🔄 Setting up lobby polling...');

    const pollLobbyInfo = async () => {
      const user = currentUserRef.current;
      const lobby = currentLobbyRef.current;

      if (!user || !lobby) return;

      try {
        console.log('[useRestoreSession] 📡 Polling lobby info...');
        const lobbyInfo = await gameService.getLobbyInfo(lobby.code, user.id);
        
        // Update users list - only if different to prevent flickering
        const newUsers = gameService.convertParticipantsToUsers(
          lobbyInfo.participants,
          lobbyInfo.host_name,
          user.id,
          user.name,
          user.role === 'host'
        );

        // Prevent flickering: if we have participants but the update shows none (only host),
        // ignore the user update to prevent clearing the UI temporarily.
        const users = (lobby.users.length > 1 && newUsers.length === 1) ? lobby.users : newUsers;

        // Determine new status
        const newStatus = lobbyInfo.start_time ? 'playing' : 'waiting';
        
        // Check if status changed
        if (newStatus !== lobby.status) {
          console.log('[useRestoreSession] 🎮 Status changed:', lobby.status, '->', newStatus);
          
          // Navigate if needed
          if (newStatus === 'playing') {
            if (user.role === 'host') {
              console.log('[useRestoreSession] 🚀 Navigating host to game...');
              navigate('/host-game');
            } else {
              console.log('[useRestoreSession] 🚀 Navigating participant to game...');
              navigate('/participant-game');
            }
          }
        }

        // Build update object
        const updates: Partial<LobbyType> = {
          status: newStatus,
          start_time: lobbyInfo.start_time,
          concept: lobbyInfo.secret_concept,
          context: lobbyInfo.context,
          topic: lobbyInfo.topic,
          timeLimit: lobbyInfo.timelimit,
        };

        // Only update users if they actually changed
        if (JSON.stringify(users) !== JSON.stringify(lobby.users)) {
          updates.users = users;
        }

        // For hosts, also update questions if available
        if (user.role === 'host' && lobbyInfo.questions && lobbyInfo.questions.length > 0) {
          const incomingQuestions = lobbyInfo.questions.map((q) => ({
            id: q.question_id,
            userId: q.user_id,
            userName: q.user_name,
            question: q.question,
            answer: q.answer as Question['answer'],
            timestamp: q.timestamp
          }));
          
          // Append new questions to existing ones instead of replacing
          const existingQuestions = lobby.questions || [];
          const existingIds = new Set(existingQuestions.map(q => q.id));
          
          // Only add questions that don't already exist
          const questionsToAdd = incomingQuestions.filter((q) => !existingIds.has(q.id));
          
          // Also update existing questions if their answer changed
          const updatedExisting = existingQuestions.map(existingQ => {
            const incoming = incomingQuestions.find((q) => q.id === existingQ.id);
            if (incoming && incoming.answer !== existingQ.answer) {
              return incoming;
            }
            return existingQ;
          });
          
          const newQuestions = [...updatedExisting, ...questionsToAdd];
          
          // Only update if questions actually changed
          if (newQuestions.length !== existingQuestions.length || 
              newQuestions.some((q, i) => {
                const curr = existingQuestions[i];
                return !curr || q.id !== curr.id || q.answer !== curr.answer;
              })) {
            updates.questions = newQuestions;
          }
        }

        // Only update if something actually changed
        if (Object.keys(updates).length > 0) {
          updateLobby(updates);
          console.log('[useRestoreSession] ✅ Lobby info updated');
        }

      } catch (error) {
        console.error('[useRestoreSession] ❌ Error polling lobby info:', error);
        // If lobby not found or other error, clear session
        if (error instanceof Error && error.message.includes('404')) {
          console.log('[useRestoreSession] 🧹 Lobby not found, clearing session...');
          localStorage.removeItem('gameUserData');
          setCurrentUser(null);
          setCurrentLobby(null);
          navigate('/');
        }
      }
    };

    // Initial poll
    pollLobbyInfo();

    // Set up interval
    pollIntervalRef.current = setInterval(pollLobbyInfo, 3000); // Poll every 3 seconds

    // Cleanup
    return () => {
      if (pollIntervalRef.current) {
        console.log('[useRestoreSession] 🛑 Stopping lobby polling');
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!currentUser, !!currentLobby]); // Only depend on existence, not values

  return {
    isRestored: !!currentUser && !!currentLobby,
    clearSession: () => {
      console.log('[useRestoreSession] 🧹 Manually clearing session...');
      localStorage.removeItem('gameUserData');
      setCurrentUser(null);
      setCurrentLobby(null);
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    }
  };
};
