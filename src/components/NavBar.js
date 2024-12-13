import React, { useContext, useState } from 'react';
import { FaHome, FaChartBar, FaUser } from 'react-icons/fa';
import { UserContext } from '../contexts/UserContext';
import { API_URL } from '../config';

function NavBar() {
  const { userName, setUserName, clientUID, userCode } = useContext(UserContext);
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(userName || '');

  console.log('NavBar render:', { userName, clientUID, userCode }); // Debug line

  const handleSaveName = async () => {
    setIsEditing(false);
    setUserName(tempName);

    await fetch(`${API_URL}/set-name`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientUID, userName: tempName }),
    });
  };

  return (
    <nav className="navbar">
      <div className="navbar-links">
        <a href="/" className="navbar-link">
          <FaHome style={{ marginRight: '5px' }} /> Home
        </a>
        <a href="/leaderboard" className="navbar-link">
          <FaChartBar style={{ marginRight: '5px' }} /> Leaderboard
        </a>
      </div>
      <div className="navbar-user">
        <FaUser className="navbar-user-icon" />
        {isEditing ? (
          <input
            type="text"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            onBlur={handleSaveName}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveName();
            }}
            autoFocus
            className="navbar-user-input"
          />
        ) : (
          <div className="user-info">
            <span className="navbar-username" onClick={() => setIsEditing(true)}>
              {userName || 'Click to Edit Name'}
            </span>
            <span className="user-code" title="Your unique identifier">
              ({userCode})
            </span>
          </div>
        )}
      </div>
    </nav>
  );
}

export default NavBar;