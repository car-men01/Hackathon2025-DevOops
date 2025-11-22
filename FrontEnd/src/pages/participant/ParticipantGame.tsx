import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import type { Question } from '../../types';
import { gameService } from '../../services';
import './ParticipantGame.css';

export const ParticipantGame: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, currentLobby, addQuestion, updateLobby } = useGame();
  const [questionText, setQuestionText] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [error, setError] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [totalTimeLimit, setTotalTimeLimit] = useState(0);
  const [narwhalFrame, setNarwhalFrame] = useState(0);

  const narwhalFrames = [
    '/narwal_animation_split/00.jpg',
    '/narwal_animation_split/01.jpg',
    '/narwal_animation_split/02.jpg',
    '/narwal_animation_split/10.jpg',
    '/narwal_animation_split/11.jpg',
    '/narwal_animation_split/12.jpg',
    '/narwal_animation_split/20.jpg',
    '/narwal_animation_split/21.jpg',
    '/narwal_animation_split/22.jpg',
    '/narwal_animation_split/30.jpg',
    '/narwal_animation_split/31.jpg',
    '/narwal_animation_split/32.jpg',
  ];

  useEffect(() => {
    if (!currentUser || !currentLobby) {
      navigate('/');
    }
  }, [currentUser, currentLobby, navigate]);

  // Initial fetch of lobby info to get topic
  useEffect(() => {
    if (!currentUser || !currentLobby) return;

    const fetchInitialLobbyInfo = async () => {
      try {
        const lobbyInfo = await gameService.getLobbyInfo(currentLobby.code, currentUser.id);
        console.log('[ParticipantGame] Initial lobby info:', lobbyInfo);
        
        // Update participants and topic
        const users = gameService.convertParticipantsToUsers(
          lobbyInfo.participants,
          lobbyInfo.host_name,
          currentUser.id,
          currentUser.name,
          false
        );

        // Set initial time limit and start time from server
        if (lobbyInfo.timelimit) {
          setTotalTimeLimit(lobbyInfo.timelimit);
        }
        if (lobbyInfo.start_time) {
          const serverStartTime = new Date(lobbyInfo.start_time).getTime();
          setStartTime(serverStartTime);
        }

        // Always update with the latest info from server
        updateLobby({ 
          users,
          ...(lobbyInfo.topic && { topic: lobbyInfo.topic }),
          ...(lobbyInfo.timelimit && { timeLimit: lobbyInfo.timelimit })
        });
      } catch (err) {
        console.error('[ParticipantGame] Error fetching initial lobby info:', err);
      }
    };

    fetchInitialLobbyInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

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

  useEffect(() => {
    // Narwhal animation timer - cycle through frames every 4 seconds, synchronized with pulse
    // Frame changes when narwhal is at smallest size (0% of animation)
    const frameTimer = setInterval(() => {
      setNarwhalFrame(prev => (prev + 1) % narwhalFrames.length);
    }, 4000);

    return () => clearInterval(frameTimer);
  }, []); // add narwhalFrames.length to dependency if it fails
  
  // Poll for lobby updates (other participants joining, questions, etc.)
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

        updateLobby({ 
          users
        });
      } catch (err) {
        console.error('Error polling lobby info:', err);
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(pollInterval);
  }, [currentUser, currentLobby, updateLobby]);

  if (!currentUser || !currentLobby) {
    return null;
  }

  const myQuestions = currentLobby.questions.filter(q => q.userId === currentUser.id);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAskQuestion = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!questionText.trim() || isAsking || !currentLobby) return;

    setIsAsking(true);
    setError('');

    try {
      const response = await gameService.askQuestion(currentLobby.code, questionText.trim());

      const newQuestion: Question = {
        id: Math.random().toString(36).substr(2, 9),
        userId: currentUser.id,
        userName: currentUser.name,
        question: questionText.trim(),
        answer: response.response,
        timestamp: Date.now(),
      };

      addQuestion(newQuestion);
      setQuestionText('');

      // Check if the answer is CORRECT (user guessed the concept)
      if (response.response === 'CORRECT') {
        const timeTaken = totalTimeLimit - timeRemaining;
        alert(`🎉 Congratulations! You guessed the concept!\n\nYour time: ${formatTime(timeTaken)}`);
        navigate('/results');
        return;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to ask question');
    } finally {
      setIsAsking(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAskQuestion();
    }
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

  return (
    <div className="participant-game-page">
      <div className="participant-game-layout">
        {/* Header */}
        <div className="participant-header">
          <div className="participant-header-left">
            <h1>Ask Jimmy</h1>
            <div className="participant-topic-display">
              <span className="participant-topic-label">Topic:</span>
              <span className="participant-topic-value">{currentLobby.topic || 'Not set'}</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="participant-content">
          {/* Players Sidebar */}
          <div className="participants-sidebar-game">
            <h3>Participants ({currentLobby.users.filter(u => u.role === 'participant').length})</h3>
            <div className="participants-list-game">
              {currentLobby.users.filter(u => u.role === 'participant').map((user) => {
                const questionCount = currentLobby.questions.filter(q => q.userId === user.id).length;
                const isCurrentUser = user.id === currentUser?.id;
                return (
                  <div key={user.id} className={`participant-item ${isCurrentUser ? 'current-user' : ''}`}>
                    <div className="participant-avatar">
                      {user.name[0].toUpperCase()}
                    </div>
                    <div className="participant-info">
                      <div className="participant-name">
                        {user.name}
                        {isCurrentUser && <span className="you-badge">You</span>}
                      </div>
                      <div className="participant-question-count">{questionCount} questions</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Conversation Panel */}
          <div className="conversation-panel-participant">
            <div className="conversation-log-participant">
              {myQuestions.length === 0 ? (
                <div className="empty-conversation-participant">
                  <p>Start asking Jimmy yes/no questions to discover the secret concept!</p>
                </div>
              ) : (
                myQuestions.map((q) => (
                  <div key={q.id} className="participant-log-entry">
                    {/* User Question */}
                    <div className="user-message-row-participant">
                      <div className="user-avatar-circle-participant">
                        {currentUser.name[0].toUpperCase()}
                      </div>
                      <div className="participant-question-bubble">
                        <div className="bubble-timestamp">
                          {new Date(q.timestamp).toLocaleTimeString()}
                        </div>
                        <p className="participant-question-text">{q.question}</p>
                      </div>
                    </div>
                    
                    {/* Jimmy's Answer */}
                    <div className="jimmy-answer-row-participant">
                      <div className="jimmy-avatar-circle-participant">
                        <img src="/narwal_icon.png" alt="Jimmy" className="jimmy-avatar-icon-participant" />
                      </div>
                      <div className={`participant-answer-bubble ${getAnswerClass(q.answer)}`}>
                        <span className="answer-icon-participant">{getAnswerIcon(q.answer)}</span>
                        <span className="answer-text">{getAnswerText(q.answer)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleAskQuestion} className="chat-input-container-participant">
              {error && <div className="error-message" style={{ color: 'red', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{error}</div>}
              <img src="/narwal_icon.png" alt="Jimmy" className="narwhal-icon-chat" />
              <input
                type="text"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask Jimmy a yes/no question..."
                className="chat-input-participant"
                disabled={isAsking || timeRemaining === 0}
              />
              <button 
                type="submit" 
                className="send-button-participant"
                disabled={isAsking || !questionText.trim() || timeRemaining === 0}
              >
                {isAsking ? '...' : '➤'}
              </button>
            </form>
          </div>

          {/* Right Panel - Timer and Jimmy */}
          <div className="timer-panel">
            <div className="timer-section">
              <h3>Time Remaining</h3>
              <div className={`timer-display-large ${timeRemaining < 60 ? 'timer-warning' : ''}`}>
                <span className="timer-icon">⏱️</span>
                <span className="timer-value">
                  {formatTime(timeRemaining)}
                </span>
              </div>
            </div>
            
            <div className="jimmy-section">
              <img 
                src={narwhalFrames[narwhalFrame]} 
                alt="Jimmy" 
                className="narwhal-animated" 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};