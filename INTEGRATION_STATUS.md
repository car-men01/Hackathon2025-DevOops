# Backend Integration Status

## ✅ Completed Integration

The frontend has been successfully connected to the backend API with polling for real-time updates. Here's what has been implemented:

### Connected Endpoints

1. **POST `/lobby/create`** - Create a new lobby (HostSetup component)
2. **POST `/lobby/join`** - Join an existing lobby (Lobby component)
3. **POST `/lobby/start`** - Start the game (HostSetup component)
4. **GET `/lobby/{pin}?user_id={user_id}`** - Get lobby information (polling in WaitingRoom, HostSetup, ParticipantGame)
5. **POST `/lobby/{pin}/question`** - Ask a question (ParticipantGame component)

### Polling Implementation

The following components use polling (setInterval) to check for updates:

- **HostSetup**: Polls every 2 seconds to update participant list
- **WaitingRoom**: Polls every 2 seconds to detect when host starts the game
- **ParticipantGame**: Polls every 3 seconds to update participant list

### Configuration

- **API URL**: Configured in `FrontEnd/.env` as `VITE_API_URL=http://localhost:8000/api/v1`
- All API calls go through `gameService.ts` service layer

---

## ⚠️ Missing Backend Endpoints

The following functionality exists in the frontend but **does NOT have corresponding backend endpoints**:

### 1. **Get All Questions in Lobby** (For Host View)
**Frontend Need**: HostGame component needs to display all questions from all participants in real-time

**Missing Endpoint**:
```
GET /lobby/{pin}/questions?user_id={host_id}
```

**Response Schema**:
```typescript
{
  questions: [
    {
      id: string;
      user_id: string;
      user_name: string;
      question: string;
      answer: 'Yes' | 'No' | "I don't know" | 'Off-topic' | 'Invalid question' | 'CORRECT';
      timestamp: number;
    }
  ]
}
```

**Purpose**: Allow host to monitor all participant questions in real-time

---

### 2. **Get Leaderboard/Results**
**Frontend Need**: Results component needs to display final scores and winner

**Missing Endpoint**:
```
GET /lobby/{pin}/results?user_id={user_id}
```

**Response Schema**:
```typescript
{
  winner: {
    user_id: string;
    user_name: string;
    score: number;
    questions_used: number;
    time_taken: number; // seconds
  };
  participants: [
    {
      user_id: string;
      user_name: string;
      score: number;
      questions_used: number;
      completed: boolean;
    }
  ];
  concept: string;
}
```

**Purpose**: Display game results and leaderboard

---

### 3. **End Game** (Host Action)
**Frontend Need**: HostGame component has "End Game" button but no backend support

**Missing Endpoint**:
```
POST /lobby/{pin}/end
```

**Request Schema**:
```typescript
{
  host_id: string;
}
```

**Response Schema**:
```typescript
{
  lobby_ended: boolean;
  final_results: { /* same as results endpoint */ }
}
```

**Purpose**: Allow host to manually end the game before time runs out

---

### 4. **Session ID in Start Response**
**Issue**: Backend's `LobbyStartResponse` schema includes `session_id` but the API doesn't return it

**Current Schema**:
```python
class LobbyStartResponse(BaseModel):
    pin: str
    session_id: str  # NOT BEING RETURNED
    lobby_started: bool
    participants: List[str]
```

**Fix Needed**: Either remove `session_id` from schema or populate it in the response

---

## 📝 Recommendations

### Option 1: Minimal Implementation (Recommended)
Keep current functionality working without real-time question sharing:
- Skip endpoint #1 (host sees only aggregated stats)
- Implement endpoint #2 for results page
- Skip endpoint #3 (games time out naturally)

### Option 2: Full Implementation
Implement all missing endpoints for complete functionality:
- Endpoint #1: Real-time question monitoring for host
- Endpoint #2: Results and leaderboard
- Endpoint #3: Manual game end

---

## 🔧 Frontend Changes Made

### Files Created/Modified:

1. **FrontEnd/.env** - Added API URL configuration
2. **FrontEnd/src/types/index.ts** - Updated types to match backend schemas
3. **FrontEnd/src/services/gameService.ts** - Complete rewrite with real API calls
4. **FrontEnd/src/context/GameContext.tsx** - Cleaned up (removed mock references)
5. **FrontEnd/src/pages/shared/Lobby.tsx** - Connected to backend join endpoint
6. **FrontEnd/src/pages/host/HostSetup.tsx** - Connected to create and start endpoints with polling
7. **FrontEnd/src/pages/participant/WaitingRoom.tsx** - Added polling for game start
8. **FrontEnd/src/pages/participant/ParticipantGame.tsx** - Connected to question endpoint with polling

### Key Features Implemented:

✅ Lobby creation with 7-digit PIN
✅ Participant joining via PIN
✅ Real-time participant list updates (polling)
✅ Game start detection (polling)
✅ Question submission to AI
✅ Answer display (Yes/No/I don't know/Off-topic/Invalid question/CORRECT)
✅ Winning detection (CORRECT response)
✅ Error handling and loading states

---

## 🚀 Testing Instructions

### Start Backend:
```bash
cd Backend
python run.py
```

### Start Frontend:
```bash
cd FrontEnd
npm install
npm run dev
```

### Test Flow:
1. Open browser to frontend URL
2. Create lobby as host (enter name, click "Create Lobby")
3. On setup page, enter concept and context, note the PIN
4. Open new incognito window, click "Join Lobby", enter PIN and participant name
5. Host clicks "Start Game"
6. Participant should be redirected to game page automatically
7. Participant asks questions and receives answers from AI
8. When participant guesses correctly (question contains the concept word), they win

---

## 📊 API Response Format Notes

The backend uses these answer types:
- `"Yes"` - Affirmative answer
- `"No"` - Negative answer  
- `"I don't know"` - AI unsure
- `"Off-topic"` - Question not relevant
- `"Invalid question"` - Not a proper yes/no question
- `"CORRECT"` - User guessed the secret concept

Frontend has been updated to handle these exact strings.
