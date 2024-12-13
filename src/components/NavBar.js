import React, { useContext, useState } from 'react';
import { FaHome, FaChartBar, FaUser, FaKey } from 'react-icons/fa';
import { UserContext } from '../contexts/UserContext';
import { API_URL } from '../config';

function NavBar() {
  const { userName, setUserName, clientUID, userCode } = useContext(UserContext);
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(userName || '');
  const [showCode, setShowCode] = useState(false);

  const handleSaveName = async () => {
    setIsEditing(false);
    setUserName(tempName);

    // Update UID-to-Username mapping in the backend
    await fetch(`${API_URL}/set-name`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        clientUID, 
        userName: tempName,
        userCode // Include userCode in the mapping
      }),
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
          <span
            className="navbar-username"
            onClick={() => setIsEditing(true)}
          >
            {userName || 'Click to Edit Name'}
          </span>
        )}
        <FaKey 
          className="navbar-user-icon" 
          style={{ marginLeft: '10px', cursor: 'pointer' }}
          onClick={() => setShowCode(!showCode)}
        />
        {showCode && (
          <div className="user-code-popup">
            <p>Your Code: <strong>{userCode}</strong></p>
            <small>Use this code to link devices</small>
          </div>
        )}
      </div>
    </nav>
  );
}

export default NavBar;