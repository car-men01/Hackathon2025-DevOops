export type UserRole = 'host' | 'participant';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  score: number;
}

export interface Question {
  id: string;
  userId: string;
  userName: string;
  question: string;
  answer: 'YES' | 'NO' | 'I_DONT_KNOW' | 'OUT_OF_CONTEXT';
  timestamp: number;
}

export interface Lobby {
  id: string;
  code: string;
  ownerId: string;
  concept?: string;
  context?: string;
  timeLimit?: number;
  users: User[];
  status: 'waiting' | 'playing' | 'finished';
  questions: Question[];
  maxQuestions: number;
  winner?: User;
}

export interface GameState {
  currentUser: User | null;
  currentLobby: Lobby | null;
  selectedStudentId?: string;
}
