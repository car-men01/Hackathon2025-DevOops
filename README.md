# Ask Jimmy - The Concept Detective 🐋

An interactive educational game where students guess secret concepts by asking yes/no questions to Jimmy the Narwhal, powered by AI. Perfect for classroom learning, remote education, and concept exploration!

![Game Status](https://img.shields.io/badge/status-active-success)
![License](https://img.shields.io/badge/license-MIT-blue)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Usage Guide](#usage-guide)
- [Game Flow](#game-flow)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

**Ask Jimmy - The Concept Detective** is a web-based educational game designed to help students learn through inquiry-based discovery. A host (teacher) sets up a game with a secret concept, topic, context, and time limit. Students (participants) then ask yes/no questions to Jimmy the Narwhal, an AI-powered assistant, to deduce the secret concept.

### Key Objectives

- **Active Learning**: Encourages critical thinking and deductive reasoning
- **Engagement**: Gamified approach to concept exploration
- **Flexibility**: Suitable for any subject - history, science, literature, and more
- **Real-time Interaction**: Live feedback and scoring system
- **Competition**: Leaderboard based on questions asked and time taken

## ✨ Features

### For Hosts (Teachers)

- **Game Setup**: Configure topic, secret concept, context, and time limit
- **Live Monitoring**: View all participants and their questions in real-time
- **Conversation Tracking**: Monitor all question-answer pairs across all students
- **Statistics Dashboard**: Track total questions, YES/NO answer counts
- **Game Control**: Start and end games at will
- **Results Overview**: Comprehensive leaderboard with performance metrics

### For Participants (Students)

- **Easy Join**: Join games using a simple 6-digit lobby code
- **AI Interaction**: Ask questions to Jimmy the Narwhal
- **Live Timer**: Countdown timer showing remaining time
- **Question History**: View your own question history
- **Animated Mascot**: Engaging narwhal animation throughout gameplay
- **Performance Results**: See your rank, questions used, and time taken

### Game Mechanics

- **Intelligent Scoring**: Winner determined by fewest questions (primary) and fastest time (secondary)
- **AI Responses**: Four types of answers - YES, NO, I DON'T KNOW, OUT OF CONTEXT
- **Auto-win Detection**: Game automatically ends when concept is guessed
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Celebration Effects**: Animated narwhal and floating bubbles on results screen

## 🛠 Technology Stack

### Frontend

- **React 19.2** - Modern UI library with hooks
- **TypeScript 5.9** - Type-safe JavaScript
- **Vite 7.2** - Lightning-fast build tool and dev server
- **React Router 7** - Client-side routing
- **Context API** - State management
- **CSS3** - Custom styling with animations and gradients

### Backend

- **FastAPI 0.121** - Modern Python web framework
- **Python 3.x** - Backend programming language
- **SQLAlchemy 2.0** - SQL toolkit and ORM
- **PostgreSQL** - Relational database
- **Alembic 1.13** - Database migration tool
- **Pydantic 2.0** - Data validation and settings management

### AI & Machine Learning

- **LangChain 0.3** - AI orchestration framework
- **Google Gemini AI** - Large language model for intelligent responses
- **langchain-google-genai 2.0** - Google AI integration for LangChain

### Additional Technologies

- **Uvicorn** - ASGI server for FastAPI
- **python-dotenv** - Environment variable management
- **QRCode** - Generate QR codes for lobby sharing
- **httpx** - HTTP client for async requests

## 📁 Project Structure

```
Hackathon2025-DevOops/
├── Backend/                        # FastAPI backend application
│   ├── alembic/                   # Database migrations
│   │   ├── versions/              # Migration scripts
│   │   └── env.py                 # Alembic configuration
│   ├── app/
│   │   ├── core/                  # Core configurations
│   │   │   └── config.py          # App settings
│   │   ├── database/              # Database setup
│   │   │   ├── session.py         # DB session management
│   │   │   └── create_database.py # DB initialization
│   │   ├── GeminiUtils/           # AI utilities
│   │   │   └── PromptsEngineering.py  # AI prompt templates
│   │   ├── models/                # SQLAlchemy models
│   │   │   ├── base.py            # Base model
│   │   │   ├── lobby.py           # Lobby model
│   │   │   ├── question.py        # Question model
│   │   │   └── user.py            # User model
│   │   ├── repositories/          # Data access layer
│   │   │   └── lobby_repository.py
│   │   ├── routes/                # API endpoints
│   │   │   └── api.py             # Main API routes
│   │   ├── schemas/               # Pydantic schemas
│   │   │   └── lobby.py           # Request/response models
│   │   ├── services/              # Business logic
│   │   │   ├── GameMasterAgent.py # Game orchestration
│   │   │   ├── GeminiAgent.py     # AI agent logic
│   │   │   └── QRService.py       # QR code generation
│   │   └── main.py                # Application entry point
│   ├── alembic.ini                # Alembic configuration
│   ├── requirements.txt           # Python dependencies
│   ├── run.py                     # Development server script
│   └── README.md                  # Backend documentation
│
├── FrontEnd/                      # React frontend application
│   ├── public/                    # Static assets
│   │   ├── narwal_animation_split/  # Narwhal animation frames (12 images)
│   │   │   ├── 00.jpg - 32.jpg    # Animation frames
│   │   ├── sounds/                # Sound effects folder
│   │   │   ├── yay.mp3            # Celebration sound
│   │   │   └── narwhal.mp3        # Narwhal sound
│   │   ├── narwal_gif.mp4         # Narwhal video for lobby
│   │   └── narwal_icon.png        # Narwhal icon
│   ├── src/
│   │   ├── assets/                # Additional assets
│   │   ├── components/            # Reusable React components
│   │   │   ├── JimmyNarwhal.tsx   # Narwhal mascot component
│   │   │   └── JimmyNarwhal.css   # Mascot styles
│   │   ├── context/               # React Context
│   │   │   └── GameContext.tsx    # Global game state management
│   │   ├── pages/                 # Page components
│   │   │   ├── host/              # Host-specific pages
│   │   │   │   ├── HostGame.tsx   # Host game monitoring
│   │   │   │   ├── HostGame.css
│   │   │   │   ├── HostSetup.tsx  # Game configuration
│   │   │   │   └── HostSetup.css
│   │   │   ├── participant/       # Participant-specific pages
│   │   │   │   ├── ParticipantGame.tsx    # Student gameplay
│   │   │   │   ├── ParticipantGame.css
│   │   │   │   ├── WaitingRoom.tsx        # Pre-game waiting
│   │   │   │   └── WaitingRoom.css
│   │   │   └── shared/            # Shared pages
│   │   │       ├── Lobby.tsx      # Entry point (create/join)
│   │   │       ├── Lobby.css
│   │   │       ├── Results.tsx    # Game results screen
│   │   │       └── Results.css
│   │   ├── services/              # API and business logic
│   │   │   ├── gameService.ts     # Game logic service
│   │   │   └── index.ts           # Service exports
│   │   ├── types/                 # TypeScript definitions
│   │   │   └── index.ts           # Type interfaces
│   │   ├── App.tsx                # Root component
│   │   ├── App.css                # Global app styles
│   │   ├── main.tsx               # Application entry point
│   │   └── index.css              # Global CSS reset/styles
│   ├── package.json               # Node dependencies
│   ├── tsconfig.json              # TypeScript configuration
│   ├── vite.config.ts             # Vite configuration
│   ├── SOUND_EFFECTS_GUIDE.md     # Sound effects documentation
│   └── README.md                  # Frontend documentation
│
├── INTEGRATION_STATUS.md          # Backend-frontend integration notes
├── .gitignore                     # Git ignore rules
└── README.md                      # This file
```

## 🚀 Setup Instructions

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Python** (v3.9 or higher)
- **PostgreSQL** (v13 or higher)
- **Google Gemini API Key** (for AI features)

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd FrontEnd
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Open browser to `http://localhost:5173`

5. **Build for production**
   ```bash
   npm run build
   ```

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd Backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   Create a `.env` file in the Backend directory:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/askjimmy
   GEMINI_API_KEY=your_gemini_api_key_here
   SECRET_KEY=your_secret_key_here
   DEBUG=True
   ```

5. **Initialize database**
   ```bash
   alembic upgrade head
   ```

6. **Start development server**
   ```bash
   python run.py
   # Or use uvicorn directly
   uvicorn app.main:app --reload
   ```

7. **Access API documentation**
   - Swagger UI: `http://localhost:8000/docs`
   - ReDoc: `http://localhost:8000/redoc`

### Database Setup

1. **Create PostgreSQL database**
   ```sql
   CREATE DATABASE askjimmy;
   ```

2. **Run migrations**
   ```bash
   cd Backend
   alembic upgrade head
   ```

3. **Create new migration** (when models change)
   ```bash
   alembic revision --autogenerate -m "Description of changes"
   alembic upgrade head
   ```

### Sound Effects Setup (Optional)

1. **Add sound files** to `FrontEnd/public/sounds/`
   - `yay.mp3` - Celebration sound
   - `narwhal.mp3` - Narwhal sound effect

2. **Recommended sources**:
   - Freesound.org
   - Pixabay.com/sound-effects
   - Mixkit.co/free-sound-effects

See `FrontEnd/SOUND_EFFECTS_GUIDE.md` for detailed instructions.

## 📖 Usage Guide

### For Hosts (Teachers)

1. **Start a New Game**
   - Go to the lobby page
   - Enter your name
   - Click "Create Lobby"

2. **Configure Game Settings**
   - **Topic**: What students will see (e.g., "Historical Events")
   - **Secret Word**: The concept to guess (e.g., "French Revolution")
   - **Context**: Additional clarification for AI
   - **Time Limit**: Game duration in minutes

3. **Share Lobby Code**
   - A 6-digit code is generated (e.g., "ABC123")
   - Share with students to join

4. **Monitor Gameplay**
   - View all participants in real-time
   - See every question and answer
   - Track statistics (total questions, YES/NO counts)

5. **End Game**
   - Click "End Game" button
   - View comprehensive results and rankings

### For Participants (Students)

1. **Join a Game**
   - Go to the lobby page
   - Enter your name
   - Click "Join Lobby"
   - Enter the 6-digit code from your teacher

2. **Wait for Game to Start**
   - You'll see a waiting room
   - Game details will be displayed
   - Wait for host to start

3. **Play the Game**
   - Ask yes/no questions to Jimmy
   - Review Jimmy's responses
   - Use deductive reasoning to narrow down the concept
   - Watch the timer!

4. **Win the Game**
   - Type the secret concept in your question
   - If correct, you win!
   - View your performance and ranking

## 🎮 Game Flow

```
┌─────────────────────────────────────────────────────────────┐
│                        LOBBY PAGE                            │
│  ┌──────────────┐              ┌──────────────┐            │
│  │ CREATE LOBBY │              │  JOIN LOBBY  │            │
│  └──────────────┘              └──────────────┘            │
└─────────────────────────────────────────────────────────────┘
                 │                        │
                 │                        │
        ┌────────▼────────┐      ┌───────▼──────────┐
        │   HOST SETUP     │      │  WAITING ROOM    │
        │ - Topic          │      │  (Participants)  │
        │ - Secret Word    │      └──────────────────┘
        │ - Context        │               │
        │ - Time Limit     │               │
        └─────────────────┘               │
                 │                         │
                 │      GAME STARTS        │
                 └────────┬────────────────┘
                          │
                ┌─────────▼─────────┐
                │    GAME ACTIVE    │
                ├───────────────────┤
                │  Host: Monitor    │
                │  Participants:    │
                │  Ask Questions    │
                └─────────┬─────────┘
                          │
                    ┌─────▼─────┐
                    │   GAME    │
                    │   ENDS    │
                    └─────┬─────┘
                          │
                ┌─────────▼─────────┐
                │  RESULTS SCREEN   │
                │  - Winner         │
                │  - Leaderboard    │
                │  - Statistics     │
                └───────────────────┘
```

## 🔌 API Documentation

### Base URL
```
http://localhost:8000/api/v1
```

### Endpoints

#### Lobbies

**Create Lobby**
```http
POST /lobbies
Content-Type: application/json

{
  "owner_id": "string",
  "topic": "string",
  "concept": "string",
  "context": "string",
  "time_limit": 600
}
```

**Get Lobby**
```http
GET /lobbies/{lobby_code}
```

**Update Lobby**
```http
PUT /lobbies/{lobby_code}
Content-Type: application/json

{
  "status": "playing" | "finished"
}
```

#### Questions

**Ask Question**
```http
POST /questions
Content-Type: application/json

{
  "lobby_code": "string",
  "user_id": "string",
  "question": "string"
}
```

**Get Questions**
```http
GET /lobbies/{lobby_code}/questions
```

### Response Types

- `YES` - Affirmative answer
- `NO` - Negative answer  
- `I_DONT_KNOW` - AI lacks information
- `OUT_OF_CONTEXT` - Question not relevant to topic

## 🎨 Design Features

### Animations

- **Narwhal Animation**: 12-frame sprite animation cycling every 4 seconds
- **Pulse Effect**: Smooth scale animation (1.0 to 1.08)
- **Floating Bubbles**: 8 bubbles with varying sizes and speeds
- **Smooth Transitions**: All interactions have CSS transitions

### Color Scheme

- **Primary Blue**: `#1E90FF` (Dodger Blue)
- **Secondary Blue**: `#00BFFF` (Deep Sky Blue)
- **Turquoise**: `#40E0D0` (Secret word highlight)
- **Gold**: `#FFD700` (Winner announcements)
- **Background**: Light blue gradients

### Responsive Design

- Mobile-first approach
- Viewport-relative sizing
- Hidden scrollbars for clean UI
- Touch-friendly buttons and inputs

## 🧪 Testing

### Frontend Testing

```bash
cd FrontEnd
npm run lint        # Run ESLint
npm run build       # Test production build
```

### Backend Testing

```bash
cd Backend
pytest              # Run test suite (when tests are added)
python -m flake8    # Code linting
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Standards

- **TypeScript**: Follow ESLint configuration
- **Python**: Follow PEP 8 style guide
- **Commits**: Use descriptive commit messages
- **Documentation**: Update README for significant changes

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **DevOops Team** - Hackathon 2025

## 🙏 Acknowledgments

- Google Gemini AI for intelligent question answering
- LangChain for AI orchestration
- React and FastAPI communities
- All contributors and testers

## 📞 Support

For issues, questions, or suggestions:

- Open an issue on GitHub
- Check existing documentation
- Review INTEGRATION_STATUS.md for backend-frontend integration notes

## 🚧 Future Enhancements

- [ ] Real-time WebSocket communication
- [ ] Multiple game modes
- [ ] User authentication and profiles
- [ ] Game history and analytics
- [ ] Mobile apps (iOS/Android)
- [ ] Multi-language support
- [ ] Custom themes
- [ ] Advanced AI prompts
- [ ] Team-based gameplay
- [ ] Achievement system

---

**Made with ❤️ for educators and learners everywhere** 🐋📚
