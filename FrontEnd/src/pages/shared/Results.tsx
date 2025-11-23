import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { gameService } from '../../services/gameService';
import { GameReportPdf } from './GameReportPdf';
import type { LeaderboardEntry } from '../../types';
import './Results.css';

export const Results: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, currentLobby, setCurrentUser, setCurrentLobby } = useGame();
  const [narwhalFrame, setNarwhalFrame] = useState(0);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);

  // State for the official API data for the PDF
  const [pdfData, setPdfData] = useState<any[]>([]); 
  const [isPdfReady, setIsPdfReady] = useState(false);

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

  // 1. Fetch Official Leaderboard for PDF
  useEffect(() => {
    const fetchLeaderboardForPdf = async () => {
      if (!currentLobby?.code) return;

      try {
        console.log('[Results] Fetching leaderboard for PDF generation...');
        const data = await gameService.getLeaderboard(currentLobby.code);
        console.log('[Results] Leaderboard data for PDF:', data);

        // Determine if 'data' is the array itself, or if it's inside 'data.leaderboard'
        let listToMap: any[] = [];
        
        if (Array.isArray(data)) {
            // Case 1: The service returned the array directly
            listToMap = data;
        } else if (data && Array.isArray(data.leaderboard)) {
            // Case 2: The service returned { pin: "...", leaderboard: [...] }
            listToMap = data.leaderboard;
        } else {
            console.warn("Unexpected leaderboard data structure:", data);
            return;
        }

        // Map Python API response (snake_case) to PDF props (camelCase)
        const mappedData = listToMap.map((entry: any) => ({
          id: entry.user_id || Math.random(),
          name: entry.name,
          questionsUsed: entry.question_count,
          timeElapsed: entry.time_elapsed
        }));

        setPdfData(mappedData);
        setIsPdfReady(true);
      } catch (error) {
        console.error("Failed to fetch leaderboard for PDF:", error);
      }
    };

    fetchLeaderboardForPdf();
  }, [currentLobby?.code]);

  // 2. Sounds and Animation
  useEffect(() => {
    const playSounds = async () => {
      try {
        const yaySoundPath = '/sounds/yay.mp3';
        const yayAudio = new Audio(yaySoundPath);
        await yayAudio.play();
      } catch (error) {
        console.log('Sound playback error:', error);
      }
    };

    playSounds();

    const frameTimer = setInterval(() => {
      setNarwhalFrame(prev => (prev + 1) % narwhalFrames.length);
    }, 4000);

    return () => clearInterval(frameTimer);
  }, [narwhalFrames.length]);

  useEffect(() => {
    if (!currentLobby?.code) return;

    const fetchLeaderboard = async () => {
      try {
        const response = await gameService.getLeaderboard(currentLobby.code);
        setLeaderboardData(response.leaderboard);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      }
    };

    fetchLeaderboard(); // Initial fetch
    const interval = setInterval(fetchLeaderboard, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, [currentLobby?.code]);

  if (!currentUser || !currentLobby) {
    navigate('/');
    return null;
  }

  const isTeacher = currentUser.role === 'host';
  const students = currentLobby.users.filter(u => u.role === 'participant');
  
  // Local scores for immediate HTML display (Client-side calculation)
  const studentScores = students.map(student => {
    const studentQuestions = currentLobby.questions.filter(q => q.userId === student.id);
    const questionsUsed = studentQuestions.length;
    const timeElapsed = student.timeElapsed || 0;

    // Find backend data for this student
    // Match by name because IDs for other participants are generated locally and won't match backend UUIDs
    const backendData = leaderboardData.find(l => l.name === student.name);
    const guessedCorrect = backendData ? backendData.guessed_correct : false;
    // Use backend question count if available, otherwise local
    const finalQuestionsUsed = backendData ? backendData.question_count : questionsUsed;

    return { ...student, questionsUsed: finalQuestionsUsed, timeElapsed, guessedCorrect };
  }).sort((a, b) => {
    // Prioritize those who guessed correctly
    if (a.guessedCorrect && !b.guessedCorrect) return -1;
    if (!a.guessedCorrect && b.guessedCorrect) return 1;

    // Sort by questions first (fewer is better), then by time (less is better)
    if (a.questionsUsed !== b.questionsUsed) {
      return a.questionsUsed - b.questionsUsed;
    }
    return a.timeElapsed - b.timeElapsed;
  });

  const winner = currentLobby.winner || studentScores[0];
  
  // Determine winner based on API data for PDF consistency
  const apiWinner = pdfData.length > 0 ? pdfData[0] : null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNewGame = () => {
    setCurrentUser(null);
    setCurrentLobby(null);
    navigate('/');
  };

  return (
    <div className="results-page">
      {/* Animated Bubbles */}
      <div className="bubble bubble-1"></div>
      <div className="bubble bubble-2"></div>
      <div className="bubble bubble-3"></div>
      <div className="bubble bubble-4"></div>
      <div className="bubble bubble-5"></div>
      <div className="bubble bubble-6"></div>
      <div className="bubble bubble-7"></div>
      <div className="bubble bubble-8"></div>

      <div className="results-container">
        <div className="results-header">
          <h1>Game Over!</h1>
          
          <div className="narwhal-celebration">
            <img 
              src={narwhalFrames[narwhalFrame]} 
              alt="Jimmy celebrates" 
              className="narwhal-animated-results" 
            />
          </div>

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
                  <span className="col-time">Time</span>
                </div>
                {studentScores.map((student, index) => (
                  <div key={student.id} className={`results-table-row ${index === 0 ? 'winner-row' : ''} ${student.guessedCorrect ? 'guessed-correct' : ''}`}>
                    <span className="col-rank">
                      {index === 0 && '🥇'}
                      {index === 1 && '🥈'}
                      {index === 2 && '🥉'}
                      {index > 2 && `#${index + 1}`}
                    </span>
                    <span className="col-name">{student.name}</span>
                    <span className="col-questions">{student.questionsUsed}</span>
                    <span className="col-time">{formatTime(student.timeElapsed || 0)}</span>
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
                      {studentScores.find(s => s.id === currentUser.id)?.questionsUsed || 0}
                    </span>
                    <span className="score-label">Questions</span>
                  </div>
                </div>
                <div className="performance-details">
                  <div className="detail-item">
                    <span className="detail-label">Time Taken</span>
                    <span className="detail-value">
                      {formatTime(studentScores.find(s => s.id === currentUser.id)?.timeElapsed || 0)}
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
                    className={`leaderboard-item ${student.id === currentUser.id ? 'current-user' : ''} ${student.guessedCorrect ? 'guessed-correct' : ''}`}
                  >
                    <span className="leaderboard-rank">
                      {index === 0 && '🥇'}
                      {index === 1 && '🥈'}
                      {index === 2 && '🥉'}
                      {index > 2 && `#${index + 1}`}
                    </span>
                    <span className="leaderboard-name">{student.name}</span>
                    <div className="leaderboard-stats">
                      <span className="leaderboard-questions">{student.questionsUsed}Q</span>
                      <span className="leaderboard-time">{formatTime(student.timeElapsed || 0)}</span>
                    </div>
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
            <>
              {/* PDF Download Button - Shows Loading state until API data arrives */}
              {isPdfReady ? (
                <PDFDownloadLink
                  document={
                    <GameReportPdf 
                      students={pdfData} // Uses fetched API data
                      winner={apiWinner} // Uses winner from API data
                      concept={currentLobby.concept || "Unknown Concept"}
                    />
                  }
                  fileName={`game_report_${new Date().toISOString().slice(0,10)}.pdf`}
                  className="download-action-link"
                >
                  {/* @ts-ignore */}
                  {({ loading }) => (
                    <button className="download-action-button" disabled={loading}>
                      {loading ? 'Generating...' : 'Download Report'}
                    </button>
                  )}
                </PDFDownloadLink>
              ) : (
                <button className="download-action-button" disabled>
                   Loading Data...
                </button>
              )}

              <button onClick={handleNewGame} className="secondary-action-button">
                New Game
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};