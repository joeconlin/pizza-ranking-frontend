import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import RankingForm from './pages/RankingForm';
import Leaderboard from './pages/Leaderboard';
import { UserProvider } from './contexts/UserContext';
import NavBar from './components/NavBar'; // Import the NavBar

function App() {
  useEffect(() => {
    // Ensure a clientUID exists in localStorage
    const getOrCreateUID = () => {
      let clientUID = localStorage.getItem('clientUID');
      if (!clientUID) {
        clientUID = crypto.randomUUID(); // Generate a unique identifier
        localStorage.setItem('clientUID', clientUID);
      }
      return clientUID;
    };

    // Generate UID if not present
    getOrCreateUID();
  }, []);

  return (
    <UserProvider>
      <Router>
        <div className="container mt-5">
          <NavBar /> {/* Include NavBar */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/ranking-form" element={<RankingForm />} />
            <Route path="/ranking-form/:spotName" element={<RankingForm />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
          </Routes>
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;