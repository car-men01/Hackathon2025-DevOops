export type UserRole = 'host' | 'participant';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  score: number;
  questionsUsed?: number;
  timeElapsed?: number;
}

export interface Question {
  id: string;
  userId: string;
  userName: string;
  question: string;
  answer: 'Yes' | 'No' | "I don't know" | 'Off-topic' | 'Invalid question' | 'CORRECT';
  timestamp: number;
}

export interface LobbyType {
  id?: string;
  code: string;
  ownerId: string;
  topic?: string;
  concept?: string;
  context?: string;
  topic?: string;
  timeLimit?: number;
  users: User[];
  status: 'waiting' | 'playing' | 'finished';
  questions: Question[];
  maxQuestions: number;
  winner?: User;
  start_time?: string;
}

export interface GameState {
  currentUser: User | null;
  currentLobby: LobbyType | null;
  selectedStudentId?: string;
}

// Backend API Types
export interface CreateLobbyRequest {
  host_name: string;
  secret_concept: string;
  context?: string;
  topic?: string;
  time_limit?: number;
}

export interface CreateLobbyResponse {
  pin: string;
  host_id: string;
  host_name: string;
}

export interface JoinLobbyRequest {
  pin: string;
  participant_name: string;
}

export interface JoinLobbyResponse {
  pin: string;
  user_id: string;
  participant_name: string;
  host_name: string;
  participants: string[];
}

export interface StartLobbyRequest {
  pin: string;
  host_id: string;
  secret_concept?: string;
  context?: string;
  topic?: string;
  time_limit?: number;
}

export interface StartLobbyResponse {
  pin: string;
  start_time: string;
  participants: string[];
}

export interface LobbyInfoResponse {
  pin: string;
  host_name: string;
  participants: string[];
  secret_concept?: string;
  context?: string;
  start_time?: string;
  timelimit: number;
  topic: string;
}

export interface AskQuestionRequest {
  question: string;
  user_id: string;
}

export interface AskQuestionResponse {
  response: 'Yes' | 'No' | "I don't know" | 'Off-topic' | 'Invalid question' | 'CORRECT';
  questions_remaining: number | null;
}

