import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import { Lobby } from './pages/Lobby';
import { HostSetup } from './pages/HostSetup';
import { WaitingRoom } from './pages/WaitingRoom';
import { ParticipantGame } from './pages/ParticipantGame';
import { HostGame } from './pages/HostGame';
import { Results } from './pages/Results';
import './App.css';

function App() {
  return (
    <GameProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Lobby />} />
          <Route path="/host-setup" element={<HostSetup />} />
          <Route path="/waiting-room" element={<WaitingRoom />} />
          <Route path="/participant-game" element={<ParticipantGame />} />
          <Route path="/host-game" element={<HostGame />} />
          <Route path="/results" element={<Results />} />
        </Routes>
      </Router>
    </GameProvider>
  );
}

export default App;
