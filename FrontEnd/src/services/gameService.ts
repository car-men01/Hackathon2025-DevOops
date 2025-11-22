import type { Lobby, Question, User, UserRole } from '../types';
import { mockUsers, mockQuestions, MOCK_LOBBY_CODE } from './mockData';

class GameService {
  // Create a mock lobby
  createLobby(ownerId: string, _ownerRole: UserRole): Lobby {
    return {
      id: 'lobby-1',
      code: MOCK_LOBBY_CODE,
      ownerId,
      concept: undefined,
      context: undefined,
      timeLimit: 600,
      users: mockUsers,
      status: 'waiting',
      questions: [],
      maxQuestions: 10,
    };
  }

  // Join a lobby by code
  joinLobby(code: string): Lobby | null {
    if (code === MOCK_LOBBY_CODE) {
      return {
        id: 'lobby-1',
        code: MOCK_LOBBY_CODE,
        ownerId: mockUsers[0].id,
        concept: undefined,
        context: undefined,
        timeLimit: 600,
        users: mockUsers,
        status: 'waiting',
        questions: [],
        maxQuestions: 10,
      };
    }
    return null;
  }

  // Submit a question and get AI response
  async askQuestion(question: string, userId: string, userName: string): Promise<Question> {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock AI response
    const answers: Array<'YES' | 'NO' | 'I_DONT_KNOW' | 'OUT_OF_CONTEXT'> = 
      ['YES', 'NO', 'I_DONT_KNOW', 'OUT_OF_CONTEXT'];
    const randomAnswer = answers[Math.floor(Math.random() * answers.length)];

    return {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      userName,
      question: question.trim(),
      answer: randomAnswer,
      timestamp: Date.now(),
    };
  }

  // Make a guess for the secret concept
  makeGuess(guess: string, concept: string): boolean {
    return guess.toLowerCase().trim() === concept.toLowerCase().trim();
  }

  // Calculate score based on questions used
  calculateScore(questionsUsed: number): number {
    return Math.max(100 - questionsUsed * 10, 0);
  }

  // Get all users
  getUsers(): User[] {
    return mockUsers;
  }

  // Get mock questions
  getQuestions(): Question[] {
    return mockQuestions;
  }
}

export const gameService = new GameService();
