import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { JimmyNarwhal } from '../../components/JimmyNarwhal';
import './Results.css';

export const Results: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, currentLobby, setCurrentUser, setCurrentLobby } = useGame();

  if (!currentUser || !currentLobby) {
    navigate('/');
    return null;
  }

  const isTeacher = currentUser.role === 'host';
  const students = currentLobby.users.filter(u => u.role === 'participant');
  
  // Calculate scores for each student
  const studentScores = students.map(student => {
    const studentQuestions = currentLobby.questions.filter(q => q.userId === student.id);
    const score = Math.max(100 - studentQuestions.length * 10, 0);
    return { ...student, score, questionsUsed: studentQuestions.length };
  }).sort((a, b) => b.score - a.score);

  const winner = currentLobby.winner || studentScores[0];

  const handleNewGame = () => {
    setCurrentUser(null);
    setCurrentLobby(null);
    navigate('/');
  };

  return (
    <div className="results-page">
      <div className="results-container">
        <div className="results-header">
          <JimmyNarwhal state="correct" />
          <h1>Game Over!</h1>
          {winner && (
            <div className="winner-announcement">
              <h2>🎉 {winner.name} Won! 🎉</h2>
              <p className="winner-concept">The secret was: <strong>{currentLobby.concept}</strong></p>
            </div>
          )}
        </div>

        <div className="results-content">
          {isTeacher ? (
            /* Teacher View - All Students */
            <div className="teacher-results">
              <h3>Final Results - All Students</h3>
              <div className="results-table">
                <div className="results-table-header">
                  <span className="col-rank">Rank</span>
                  <span className="col-name">Student Name</span>
                  <span className="col-questions">Questions</span>
                  <span className="col-score">Score</span>
                </div>
                {studentScores.map((student, index) => (
                  <div key={student.id} className={`results-table-row ${index === 0 ? 'winner-row' : ''}`}>
                    <span className="col-rank">
                      {index === 0 && '🥇'}
                      {index === 1 && '🥈'}
                      {index === 2 && '🥉'}
                      {index > 2 && `#${index + 1}`}
                    </span>
                    <span className="col-name">{student.name}</span>
                    <span className="col-questions">{student.questionsUsed}</span>
                    <span className="col-score">{student.score}</span>
                  </div>
                ))}
              </div>

              <div className="game-stats">
                <h4>Game Statistics</h4>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-value">{currentLobby.questions.length}</span>
                    <span className="stat-label">Total Questions</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{students.length}</span>
                    <span className="stat-label">Players</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">
                      {currentLobby.questions.filter(q => q.answer === 'Yes').length}
                    </span>
                    <span className="stat-label">YES Answers</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">
                      {currentLobby.questions.filter(q => q.answer === 'No').length}
                    </span>
                    <span className="stat-label">NO Answers</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Student View - Personal Results */
            <div className="student-results">
              <div className="personal-score-card">
                <h3>Your Performance</h3>
                <div className="score-display">
                  <div className="score-circle">
                    <span className="score-number">
                      {studentScores.find(s => s.id === currentUser.id)?.score || 0}
                    </span>
                    <span className="score-max">/ 100</span>
                  </div>
                </div>
                <div className="performance-details">
                  <div className="detail-item">
                    <span className="detail-label">Questions Used</span>
                    <span className="detail-value">
                      {currentLobby.questions.filter(q => q.userId === currentUser.id).length}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Your Rank</span>
                    <span className="detail-value">
                      {studentScores.findIndex(s => s.id === currentUser.id) + 1} / {students.length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="leaderboard">
                <h3>Leaderboard</h3>
                {studentScores.slice(0, 5).map((student, index) => (
                  <div 
                    key={student.id} 
                    className={`leaderboard-item ${student.id === currentUser.id ? 'current-user' : ''}`}
                  >
                    <span className="leaderboard-rank">
                      {index === 0 && '🥇'}
                      {index === 1 && '🥈'}
                      {index === 2 && '🥉'}
                      {index > 2 && `#${index + 1}`}
                    </span>
                    <span className="leaderboard-name">{student.name}</span>
                    <span className="leaderboard-score">{student.score}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="results-actions">
          <button onClick={() => navigate('/')} className="primary-action-button">
            Back to Lobby
          </button>
          {isTeacher && (
            <button onClick={handleNewGame} className="secondary-action-button">
              New Game
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
