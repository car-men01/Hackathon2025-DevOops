# Ask Jimmy - The Concept Detective 🐋

An educational multiplayer deduction game where players interrogate Jimmy, the AI narwhal, to guess a secret concept. Built with React, TypeScript, and Vite.

## 🎮 Game Features

### Core Gameplay
- **Deduction-Based Learning**: Students ask yes/no questions to discover a secret concept
- **AI Integration Ready**: Designed for Gemini API integration (currently using mock data)
- **Multiplayer Support**: Multiple students can play simultaneously
- **Teacher Controls**: Teachers can set concepts, monitor progress, and view all student conversations

### User Roles

#### 👨‍🎓 Student Experience
- Join lobby with a code
- Wait for teacher to start the game
- Ask Jimmy (the narwhal) yes/no questions
- View all questions and answers from other students
- Make a guess when ready
- See final scores and rankings

#### 👩‍🏫 Teacher Experience
- Create lobby with unique code
- Set secret concept and optional context
- Start the game when ready
- Toggle between student conversations
- View real-time game statistics
- End game and review final results

## 🎨 Design Theme

**Smart-Cute / Oceanic Minimalist**
- Primary Color: Navy Blue (#1E90FF)
- Secondary: Electric Blue (#00BFFF)
- Accent: Gold/Orange (#FFD700, #FFA500)
- Background: Light Blue (#F0F8FF)
- Status Colors:
  - YES: Spring Green (#3CB371)
  - NO: Soft Coral Red (#FF6347)
  - N/A: Gold (#FFD700)

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation & Running

1. Navigate to the FrontEnd directory:
```bash
cd FrontEnd
```

2. Install dependencies (if not already installed):
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173/`

## 📁 Project Structure

```
FrontEnd/
├── src/
│   ├── components/
│   │   ├── JimmyNarwhal.tsx      # Animated mascot component
│   │   └── JimmyNarwhal.css      # Mascot animations
│   ├── context/
│   │   └── GameContext.tsx       # Global state management
│   ├── pages/
│   │   ├── Lobby.tsx             # Entry point for all users
│   │   ├── TeacherSetup.tsx      # Teacher game configuration
│   │   ├── WaitingRoom.tsx       # Student waiting area
│   │   ├── StudentGame.tsx       # Student gameplay view
│   │   ├── TeacherGame.tsx       # Teacher monitoring view
│   │   └── Results.tsx           # Final scores and stats
│   ├── types/
│   │   └── index.ts              # TypeScript interfaces
│   ├── App.tsx                   # Main app with routing
│   ├── App.css                   # Global styles
│   └── index.css                 # Root styles
├── package.json
└── vite.config.ts
```

## 🎭 Game Flow

1. **Lobby Entry**
   - Teacher creates lobby → Gets unique code
   - Students join with code → Wait for start

2. **Teacher Setup**
   - Teacher enters secret concept (e.g., "Photosynthesis")
   - Adds optional context for clarity
   - Starts game when ready

3. **Gameplay**
   - Students ask yes/no questions
   - Jimmy (AI) responds with YES/NO/N/A
   - All questions visible to all players
   - Students can guess at any time

4. **Results**
   - Winner announced
   - Scores based on questions used
   - Teacher sees all student statistics
   - Students see personal performance

## 🧩 Mock Data

The app currently uses mock data to demonstrate functionality:

- **Mock Users**: 4 pre-configured users (1 teacher, 3 students)
- **Mock Questions**: Sample question/answer history
- **Mock Answers**: Randomized YES/NO/N/A responses
- **Mock Concept**: "Photosynthesis" as default

## 🔮 Future Enhancements

### Ready for Backend Integration
- WebSocket support for real-time multiplayer
- Gemini API integration for intelligent responses
- QR code + PIN lobby joining (Kahoot-style)
- TCP/UDP connection options
- User authentication
- Persistent game history
- Analytics dashboard

### Planned Features
- Difficulty levels
- Time limits per game
- Hint system
- Custom scoring algorithms
- Leaderboard persistence
- Multiple game modes

## 🎨 Mascot Animations

**Jimmy the Narwhal** has 5 states:
- **Idle**: Gentle floating with sparkling horn
- **Waiting**: Leaning forward with curious eyes
- **Processing**: Spinning with vibrating horn
- **Correct**: Jumping with bubbles
- **Incorrect**: Sad blinking expression

## 🛠️ Technologies

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Navigation
- **CSS3** - Styling with animations
- **Context API** - State management

## 📝 Implementation Notes

- All data is currently mock/simulated
- No backend required to run the demo
- Designed for desktop/tablet (responsive mobile TBD)
- Light mode only (matching design spec)
- Fully typed with TypeScript
- No compilation errors

## 🎯 Educational Value

This game teaches:
- **Critical Thinking**: Strategic question formulation
- **Deductive Reasoning**: Narrowing possibilities logically
- **Linguistic Precision**: Crafting clear yes/no questions
- **Collaboration**: Learning from peers' questions
- **Subject Mastery**: Deep understanding of concepts

## 👥 Credits

Built for Hermes Hackathon 2025 - DevOops Team
App Name: Ask Jimmy
Mascot: Jimmy the Narwhal 🐋

---

**Have fun playing Ask Jimmy! 🎉**
