import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { gameService } from '../../services/gameService';
import './ParticipantGame.css';

export const ParticipantGame: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, currentLobby, addQuestion, updateLobby } = useGame();
  const [questionText, setQuestionText] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(currentLobby?.timeLimit || 600);
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

  useEffect(() => {
    // Countdown timer
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Narwhal animation timer - cycle through frames every 4 seconds, synchronized with pulse
    // Frame changes when narwhal is at smallest size (0% of animation)
    const frameTimer = setInterval(() => {
      setNarwhalFrame(prev => (prev + 1) % narwhalFrames.length);
    }, 4000);

    return () => clearInterval(frameTimer);
  }, [narwhalFrames.length]);

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
    if (!questionText.trim() || isAsking) return;

    setIsAsking(true);

    try {
      const newQuestion = await gameService.askQuestion(
        questionText,
        currentUser.id,
        currentUser.name
      );

      // Check if the question contains the concept
      if (currentLobby.concept && questionText.toLowerCase().includes(currentLobby.concept.toLowerCase())) {
        // Calculate time elapsed
        const timeElapsed = (currentLobby.timeLimit || 600) - timeRemaining;
        const questionsUsed = currentLobby.questions.filter(q => q.userId === currentUser.id).length + 1;
        
        // Update the current user with time elapsed and questions used
        const updatedUsers = currentLobby.users.map(u => 
          u.id === currentUser.id 
            ? { ...u, timeElapsed, questionsUsed }
            : u
        );
        
        // Update lobby with winner info
        updateLobby({
          users: updatedUsers,
          winner: { ...currentUser, timeElapsed, questionsUsed },
          status: 'finished'
        });

        // Show congratulations popup
        alert(`🎉 Congratulations! You guessed the concept: "${currentLobby.concept}"\n\nQuestions used: ${questionsUsed}\nTime taken: ${formatTime(timeElapsed)}`);
        navigate('/results');
        return;
      }

      addQuestion(newQuestion);
      setQuestionText('');
    } catch (error) {
      console.error('Error asking question:', error);
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
    if (answer === 'YES') return 'answer-yes';
    if (answer === 'NO') return 'answer-no';
    if (answer === 'I_DONT_KNOW') return 'answer-idk';
    if (answer === 'OUT_OF_CONTEXT') return 'answer-ooc';
    return 'answer-na';
  };

  const getAnswerIcon = (answer: string) => {
    if (answer === 'YES') return '✓';
    if (answer === 'NO') return '✗';
    if (answer === 'I_DONT_KNOW') return '?';
    if (answer === 'OUT_OF_CONTEXT') return '!';
    return '?';
  };

  const getAnswerText = (answer: string) => {
    if (answer === 'I_DONT_KNOW') return "I Don't Know";
    if (answer === 'OUT_OF_CONTEXT') return 'Out of Context';
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
