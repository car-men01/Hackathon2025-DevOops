import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import type {Question} from '../../types';
import './HostGame.css';

export const HostGame: React.FC = () => {
  const navigate = useNavigate();
  const { currentLobby, selectedStudentId, setSelectedStudent, currentUser, updateLobby } = useGame();
  const [selectedStudent, setLocalSelectedStudent] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [totalTimeLimit, setTotalTimeLimit] = useState(0);
  
  // Keep a ref to currentLobby to use in the polling interval without stale closures
  const currentLobbyRef = useRef(currentLobby);
  useEffect(() => {
    currentLobbyRef.current = currentLobby;
  }, [currentLobby]);

  useEffect(() => {
    if (!currentLobby || currentLobby.status !== 'playing') {
      navigate('/');
    }
  }, [currentLobby, navigate]);

  // Fetch lobby info to get start time, time limit, and questions
  useEffect(() => {
    if (!currentUser?.id || !currentLobby?.code) return;

    const lobbyCode = currentLobby.code;
    const userId = currentUser.id;
    const userName = currentUser.name;

    const fetchLobbyInfo = async () => {
      try {
        const { gameService } = await import('../../services/gameService');
        const lobbyInfo = await gameService.getLobbyInfo(lobbyCode, userId);
        console.log('[HostGame] Lobby info update:', lobbyInfo);
        
        // Set initial time limit and start time from server if not set
        if (lobbyInfo.timelimit) {
          setTotalTimeLimit(lobbyInfo.timelimit);
        }
        if (lobbyInfo.start_time) {
          const serverStartTime = new Date(lobbyInfo.start_time).getTime();
          setStartTime(serverStartTime);
        }

        // Update lobby with latest info
        let users;
        if (lobbyInfo.participants_details) {
          users = gameService.convertParticipantDetailsToUsers(
            lobbyInfo.participants_details,
            lobbyInfo.host_name,
            userId,
            true
          );
        } else {
          users = gameService.convertParticipantsToUsers(
            lobbyInfo.participants,
            lobbyInfo.host_name,
            userId,
            userName,
            true
          );
        }

        // Prevent flickering: if we have participants but the update shows none (only host),
        // ignore the user update to prevent clearing the UI temporarily.
        if (currentLobbyRef.current && currentLobbyRef.current.users.length > 1 && users.length === 1) {
          users = currentLobbyRef.current.users;
        }

        const updates: Partial<typeof currentLobby> = {
          users,
          ...(lobbyInfo.topic && { topic: lobbyInfo.topic }),
          ...(lobbyInfo.timelimit && { timeLimit: lobbyInfo.timelimit })
        };

        let newQuestions: Question[] | undefined;
        if (lobbyInfo.questions && lobbyInfo.questions.length > 0) {
          newQuestions = lobbyInfo.questions.map(q => ({
            id: q.question_id,
            userId: q.user_id,
            userName: q.user_name,
            question: q.question,
            answer: q.answer as Question['answer'],
            timestamp: q.timestamp
          }));
          updates.questions = newQuestions;
        }

        // Check if we really need to update to avoid flickering
        const currentLobbyState = currentLobbyRef.current;
        if (currentLobbyState) {
          const questionsChanged = newQuestions && (
            newQuestions.length !== currentLobbyState.questions.length ||
            newQuestions.some((q, i) => {
              const curr = currentLobbyState.questions[i];
              return q.id !== curr.id || q.answer !== curr.answer;
            })
          );

          const usersChanged = JSON.stringify(updates.users) !== JSON.stringify(currentLobbyState.users);
          const topicChanged = updates.topic && updates.topic !== currentLobbyState.topic;
          const timeLimitChanged = updates.timeLimit && updates.timeLimit !== currentLobbyState.timeLimit;
          
          if (!questionsChanged && !usersChanged && !topicChanged && !timeLimitChanged) {
            return;
          }
        }

        updateLobby(updates);
      } catch (err) {
        console.error('[HostGame] Error fetching lobby info:', err);
      }
    };

    fetchLobbyInfo();
    const interval = setInterval(fetchLobbyInfo, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, [currentUser?.id, currentUser?.name, currentLobby?.code, updateLobby]);

  useEffect(() => {
    // Countdown timer based on start time
    if (!startTime || !totalTimeLimit) return;

    const timer = setInterval(() => {
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - startTime) / 1000);
      const remaining = Math.max(0, totalTimeLimit - elapsedSeconds);
      setTimeRemaining(remaining);

      if (remaining <= 0) {
        clearInterval(timer);
      }
    }, 100); // Update every 100ms for smoother countdown

    return () => clearInterval(timer);
  }, [startTime, totalTimeLimit]);

  if (!currentLobby) {
    return null;
  }

  const students = currentLobby.users.filter(u => u.role === 'participant');
  const currentStudentId = selectedStudent || selectedStudentId || students[0]?.id;
  const studentQuestions = currentLobby.questions.filter(q => q.userId === currentStudentId);
  const currentStudentName = students.find(s => s.id === currentStudentId)?.name || '';

  const handleStudentSelect = (studentId: string) => {
    setLocalSelectedStudent(studentId);
    setSelectedStudent(studentId);
  };

  const getAnswerClass = (answer: string) => {
    if (answer === 'Yes') return 'answer-yes';
    if (answer === 'No') return 'answer-no';
    if (answer === "I don't know") return 'answer-idk';
    if (answer === 'Off-topic' || answer === 'Invalid question') return 'answer-ooc';
    if (answer === 'CORRECT') return 'answer-correct';
    return 'answer-na';
  };

  const getAnswerIcon = (answer: string) => {
    if (answer === 'Yes') return '✓';
    if (answer === 'No') return '✗';
    if (answer === "I don't know") return '?';
    if (answer === 'Off-topic' || answer === 'Invalid question') return '!';
    if (answer === 'CORRECT') return '🎉';
    return '?';
  };

  const getAnswerText = (answer: string) => {
    return answer;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndGame = () => {
    navigate('/results');
  };

  const handleLeaveLobby = async () => {
    console.log('[HostGame] 🚪 Leaving lobby...');
    try {
      if (currentLobby && currentUser) {
        // Dynamically import gameService to avoid circular dependencies if any
        const { gameService } = await import('../../services/gameService');
        console.log('[HostGame] Deleting lobby:', currentLobby.code);
        await gameService.deleteLobby(currentLobby.code, currentUser.id);
        console.log('[HostGame] Lobby deleted successfully');
      }
    } catch (error) {
      console.error('[HostGame] Error deleting lobby:', error);
    }
    // Clear localStorage
    localStorage.removeItem('gameUserData');
    console.log('[HostGame] ✅ LocalStorage cleared');
    // Redirect to home
    navigate('/');
  };

  return (
    <div className="host-game-page">
      <div className="host-game-layout">
        {/* Header */}
        <div className="host-header">
          <div className="header-left">
            <div className="header-top-row">
              <h1>Ask Jimmy</h1>
              <div className="header-buttons">
                <button onClick={handleLeaveLobby} className="end-game-button">
                  Leave Lobby
                </button>
                <button onClick={handleEndGame} className="view-leaderboard-button">
                  View Leaderboard
                </button>
              </div>
            </div>
            <div className="header-info-row">
              <div className="secret-word-display">
                <span className="secret-word-label">Secret Word:</span>
                <span className="secret-word-value">{currentLobby.concept}</span>
              </div>
              <div className="concept-display">
                <span className="concept-label">Topic:</span>
                <span className="concept-value">{currentLobby.topic || 'Not set'}</span>
              </div>
            </div>
            {currentLobby.context && (
              <div className="context-display">
                <span className="context-label">Context:</span>
                <span className="context-value">{currentLobby.context}</span>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="host-content">
          {/* Participant Selector */}
          <div className="participants-sidebar">
            <h3>Participants ({students.length})</h3>
            <div className="participants-list">
              {students.map((student) => {
                const studentQCount = currentLobby.questions.filter(q => q.userId === student.id).length;
                return (
                  <div
                    key={student.id}
                    onClick={() => handleStudentSelect(student.id)}
                    className={`participant-item-host ${currentStudentId === student.id ? 'active' : ''}`}
                  >
                    <div className="participant-avatar-host">
                      {student.name[0].toUpperCase()}
                    </div>
                    <div className="participant-info-host">
                      <div className="participant-name-host">{student.name}</div>
                      <div className="participant-question-count-host">{studentQCount} questions</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Conversation View */}
          <div className="conversation-panel">
            <div className="conversation-header">
              <h2>{currentStudentName}'s Conversation</h2>
              <p>{studentQuestions.length} questions asked</p>
            </div>

            <div className="conversation-log">
              {studentQuestions.length === 0 ? (
                <div className="empty-conversation">
                  <p>This participant hasn't asked any questions yet.</p>
                </div>
              ) : (
                studentQuestions.map((q) => (
                  <div key={q.id} className="host-log-entry">
                    {/* User Question */}
                    <div className="user-message-row">
                      <div className="user-avatar-circle">
                        {q.userName[0].toUpperCase()}
                      </div>
                      <div className="host-question-bubble">
                        <div className="bubble-timestamp">
                          {new Date(q.timestamp).toLocaleTimeString()}
                        </div>
                        <p className="host-question-text">{q.question}</p>
                      </div>
                    </div>
                    
                    {/* Jimmy's Answer */}
                    <div className="jimmy-answer-row">
                      <div className="jimmy-avatar-circle">
                        <img src="/narwal_icon.png" alt="Jimmy" className="jimmy-avatar-icon" />
                      </div>
                      <div className={`host-answer-bubble ${getAnswerClass(q.answer)}`}>
                        <span className="answer-icon">{getAnswerIcon(q.answer)}</span>
                        <span className="answer-text">{getAnswerText(q.answer)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Stats Panel */}
          <div className="stats-panel">
            <h3>Game Statistics</h3>
            <div className="stats-cards">
              <div className="stat-card stat-card-timer">
                <div className="stat-timer">
                  <span className="timer-icon">⏱️</span>
                  <span className={`timer-value ${timeRemaining < 60 ? 'timer-warning' : ''}`}>
                    {formatTime(timeRemaining)}
                  </span>
                </div>
                <div className="stat-label">Time Remaining</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{currentLobby.questions.length}</div>
                <div className="stat-label">Total Questions</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{students.length}</div>
                <div className="stat-label">Active Participants</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">
                  {currentLobby.questions.filter(q => q.answer === 'Yes').length}
                </div>
                <div className="stat-label">YES Answers</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">
                  {currentLobby.questions.filter(q => q.answer === 'No').length}
                </div>
                <div className="stat-label">NO Answers</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
