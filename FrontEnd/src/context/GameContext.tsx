import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { GameState, User, Lobby, Question, UserRole } from '../types';

interface GameContextType extends GameState {
  setCurrentUser: (user: User | null) => void;
  setCurrentLobby: (lobby: Lobby | null) => void;
  updateLobby: (updates: Partial<Lobby>) => void;
  addQuestion: (question: Question) => void;
  setSelectedStudent: (studentId: string) => void;
  makeGuess: (guess: string) => boolean;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

// Mock data
const mockUsers: User[] = [
  { id: '1', name: 'Prof. Anderson', role: 'teacher', score: 0 },
  { id: '2', name: 'Alex', role: 'student', score: 0 },
  { id: '3', name: 'Maria', role: 'student', score: 0 },
  { id: '4', name: 'David', role: 'student', score: 0 },
];

const mockQuestions: Question[] = [
  {
    id: 'q1',
    userId: '2',
    userName: 'Alex',
    question: 'Is it a biological process?',
    answer: 'YES',
    timestamp: Date.now() - 300000,
  },
  {
    id: 'q2',
    userId: '3',
    userName: 'Maria',
    question: 'Does it involve animals?',
    answer: 'NO',
    timestamp: Date.now() - 240000,
  },
  {
    id: 'q3',
    userId: '4',
    userName: 'David',
    question: 'Does it happen in plants?',
    answer: 'YES',
    timestamp: Date.now() - 180000,
  },
  {
    id: 'q4',
    userId: '2',
    userName: 'Alex',
    question: 'Does it require sunlight?',
    answer: 'YES',
    timestamp: Date.now() - 120000,
  },
  {
    id: 'q5',
    userId: '3',
    userName: 'Maria',
    question: 'Is it related to mathematics?',
    answer: 'OUT_OF_CONTEXT',
    timestamp: Date.now() - 90000,
  },
  {
    id: 'q6',
    userId: '4',
    userName: 'David',
    question: 'Does it involve water?',
    answer: 'I_DONT_KNOW',
    timestamp: Date.now() - 60000,
  },
];

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>({
    currentUser: null,
    currentLobby: null,
    selectedStudentId: undefined,
  });

  const setCurrentUser = (user: User | null) => {
    setGameState(prev => ({ ...prev, currentUser: user }));
  };

  const setCurrentLobby = (lobby: Lobby | null) => {
    setGameState(prev => ({ ...prev, currentLobby: lobby }));
  };

  const updateLobby = (updates: Partial<Lobby>) => {
    setGameState(prev => ({
      ...prev,
      currentLobby: prev.currentLobby ? { ...prev.currentLobby, ...updates } : null,
    }));
  };

  const addQuestion = (question: Question) => {
    setGameState(prev => ({
      ...prev,
      currentLobby: prev.currentLobby
        ? {
            ...prev.currentLobby,
            questions: [...prev.currentLobby.questions, question],
          }
        : null,
    }));
  };

  const setSelectedStudent = (studentId: string) => {
    setGameState(prev => ({ ...prev, selectedStudentId: studentId }));
  };

  const makeGuess = (guess: string): boolean => {
    if (!gameState.currentLobby?.concept) return false;
    
    const isCorrect = guess.toLowerCase().trim() === gameState.currentLobby.concept.toLowerCase().trim();
    
    if (isCorrect && gameState.currentUser) {
      const questionsUsed = gameState.currentLobby.questions.filter(
        q => q.userId === gameState.currentUser!.id
      ).length;
      const score = Math.max(100 - questionsUsed * 10, 0);
      
      updateLobby({
        status: 'finished',
        winner: { ...gameState.currentUser, score },
      });
    }
    
    return isCorrect;
  };

  return (
    <GameContext.Provider
      value={{
        ...gameState,
        setCurrentUser,
        setCurrentLobby,
        updateLobby,
        addQuestion,
        setSelectedStudent,
        makeGuess,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
};

// Mock data generator
export const createMockLobby = (ownerId: string, ownerRole: UserRole): Lobby => {
  return {
    id: 'lobby-1',
    code: 'ABC123',
    ownerId,
    concept: ownerRole === 'teacher' ? 'Photosynthesis' : undefined,
    context: ownerRole === 'teacher' ? 'The process by which plants convert sunlight into energy' : undefined,
    users: mockUsers,
    status: 'waiting',
    questions: ownerRole === 'teacher' ? mockQuestions : [],
    maxQuestions: 10,
  };
};
