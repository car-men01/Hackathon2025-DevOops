import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import { SessionManager } from './components/SessionManager';
import { Lobby } from './pages/shared/Lobby';
import { HostSetup } from './pages/host/HostSetup';
import { WaitingRoom } from './pages/participant/WaitingRoom';
import { ParticipantGame } from './pages/participant/ParticipantGame';
import { HostGame } from './pages/host/HostGame';
import { Results } from './pages/shared/Results';
import './App.css';

function App() {
  return (
    <GameProvider>
      <Router>
        <SessionManager>
          <Routes>
            <Route path="/" element={<Lobby />} />
            <Route path="/host-setup" element={<HostSetup />} />
            <Route path="/waiting-room" element={<WaitingRoom />} />
            <Route path="/participant-game" element={<ParticipantGame />} />
            <Route path="/host-game" element={<HostGame />} />
            <Route path="/results" element={<Results />} />
          </Routes>
        </SessionManager>
      </Router>
    </GameProvider>
  );
}

export default App;
