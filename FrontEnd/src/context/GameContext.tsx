import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { GameState, User, Lobby, Question, UserRole } from '../types';
import { gameService } from '../services/gameService';

interface GameContextType extends GameState {
  setCurrentUser: (user: User | null) => void;
  setCurrentLobby: (lobby: Lobby | null) => void;
  updateLobby: (updates: Partial<Lobby>) => void;
  addQuestion: (question: Question) => void;
  setSelectedStudent: (studentId: string) => void;
  makeGuess: (guess: string) => boolean;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

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
  return gameService.createLobby(ownerId, ownerRole);
};

