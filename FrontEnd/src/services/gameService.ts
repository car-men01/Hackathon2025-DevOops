import type { 
  User,
  CreateLobbyRequest,
  CreateLobbyResponse,
  JoinLobbyRequest,
  JoinLobbyResponse,
  StartLobbyRequest,
  StartLobbyResponse,
  LobbyInfoResponse,
  AskQuestionRequest,
  AskQuestionResponse,
  GenerateQRResponse
} from '../types';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000/api/v1';

class GameService {
  private async fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_URL}${endpoint}`;
    console.log('[GameService] Fetching:', url, options?.method || 'GET');
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    console.log('[GameService] Response status:', response.status, response.statusText);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      console.error('[GameService] Error response:', error);
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log('[GameService] Response data:', data);
    return data;
  }

  // Generate a QR Code for a specific link
  async generateQRCode(link: string): Promise<string> {
    console.log('[GameService] Generating QR code for:', link);
    
    // Your Python API defines 'link' as a function argument without Body(), 
    // so FastAPI expects it as a query parameter: /qr/generate?link=...
    const encodedLink = encodeURIComponent(link);
    
    const data = await this.fetchAPI<GenerateQRResponse>(`/qr/generate?link=${encodedLink}`, {
      method: 'POST',
      // No body needed as data is in the query param
    });

    return data.qr_code_data_url;
  }

  // Create a lobby (for host)
  async createLobby(
    hostName: string, 
    secretConcept: string, 
    context?: string,
    topic?: string,
    timeLimit?: number
  ): Promise<{ pin: string; hostId: string; hostName: string }> {
    console.log('[GameService] createLobby called with:', { hostName, secretConcept, context, topic, timeLimit });
    const data = await this.fetchAPI<CreateLobbyResponse>('/lobby/create', {
      method: 'POST',
      body: JSON.stringify({
        host_name: hostName,
        secret_concept: secretConcept,
        context: context || '',
        topic: topic || '',
        time_limit: timeLimit || 600
      } as CreateLobbyRequest),
    });

    const result = {
      pin: data.pin,
      hostId: data.host_id,
      hostName: data.host_name,
    };
    console.log('[GameService] createLobby result:', result);
    return result;
  }

  // Join a lobby (for participants)
  async joinLobby(pin: string, participantName: string): Promise<JoinLobbyResponse> {
    const data = await this.fetchAPI<JoinLobbyResponse>('/lobby/join', {
      method: 'POST',
      body: JSON.stringify({
        pin,
        participant_name: participantName,
      } as JoinLobbyRequest),
    });

    return data;
  }

  // Start the lobby (host only)
  async startLobby(
    pin: string, 
    hostId: string, 
    secretConcept?: string, 
    context?: string, 
    topic?: string, 
    timeLimit?: number
  ): Promise<StartLobbyResponse> {
    const data = await this.fetchAPI<StartLobbyResponse>('/lobby/start', {
      method: 'POST',
      body: JSON.stringify({
        pin,
        host_id: hostId,
        secret_concept: secretConcept,
        context: context,
        topic: topic,
        time_limit: timeLimit,
        start_time: new Date().toISOString()
      } as StartLobbyRequest),
    });

    return data;
  }

  // Get lobby information (polling endpoint)
  async getLobbyInfo(pin: string, userId: string): Promise<LobbyInfoResponse> {
    const data = await this.fetchAPI<LobbyInfoResponse>(
      `/lobby/${pin}?user_id=${userId}`,
      { method: 'GET' }
    );

    return data;
  }

  // Ask a question to the AI
  async askQuestion(pin: string, question: string, userId: string): Promise<AskQuestionResponse> {
    const data = await this.fetchAPI<AskQuestionResponse>(`/lobby/${pin}/question`, {
      method: 'POST',
      body: JSON.stringify({
        question,
        user_id: userId,
      } as AskQuestionRequest),
    });

    return data;
  }

  // Helper: Convert backend participants list to User objects
  convertParticipantsToUsers(
    participants: string[],
    hostName: string,
    currentUserId: string,
    currentUserName: string,
    isHost: boolean
  ): User[] {
    const users: User[] = [];
    
    // Add host
    users.push({
      id: isHost ? currentUserId : 'host-id',
      name: hostName,
      role: 'host',
      score: 0,
    });

    // Add participants
    participants.forEach((name, index) => {
      if (name !== hostName) {
        const isCurrentUser = name === currentUserName && !isHost;
        users.push({
          id: isCurrentUser ? currentUserId : `participant-${index}`,
          name,
          role: 'participant',
          score: 0,
        });
      }
    });

    return users;
  }

  // Calculate score based on questions used
  calculateScore(questionsUsed: number): number {
    return Math.max(100 - questionsUsed * 10, 0);
  }
}

export const gameService = new GameService();

