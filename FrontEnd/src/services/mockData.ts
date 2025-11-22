import type { User, Question } from '../types';

// Mock Users
export const mockUsers: User[] = [
  { id: '1', name: 'Prof. Anderson', role: 'host', score: 0 },
  { id: '2', name: 'Alex', role: 'participant', score: 0 },
  { id: '3', name: 'Maria', role: 'participant', score: 0 },
  { id: '4', name: 'David', role: 'participant', score: 0 },
];

// Mock Questions
export const mockQuestions: Question[] = [
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

// Mock lobby code
export const MOCK_LOBBY_CODE = 'ABC123';
