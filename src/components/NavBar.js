import React, { useContext, useState } from 'react';
import { FaHome, FaChartBar, FaUser, FaKey } from 'react-icons/fa';
import { UserContext } from '../contexts/UserContext';
import { API_URL } from '../config';

function NavBar() {
  const { userName, setUserName, userCode } = useContext(UserContext);
  const [isEditing, setIsEditing] = useState(false);
  const [isEnteringCode, setIsEnteringCode] = useState(false);
  const [tempName, setTempName] = useState(userName || '');
  const [tempCode, setTempCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSaveName = async () => {
    setIsEditing(false);
    setUserName(tempName);

    await fetch(`${API_URL}/set-name`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userCode, userName: tempName }),
    });
  };

  const handleCodeSubmit = async () => {
    setCodeError('');
    
    if (!tempCode.trim()) {
      setCodeError('Please enter a code');
      return;
    }

    if (tempCode === userCode) {
      setCodeError('This is your current code');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userCode: tempCode }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.valid) {
          setIsSuccess(true);
          localStorage.setItem('userCode', tempCode);
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          setCodeError('Code not found. Please check and try again.');
        }
      } else {
        setCodeError('There was a problem verifying the code. Please try again.');
      }
    } catch (error) {
      setCodeError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderCodeEntryModal = () => (
    <div className="code-entry-modal" onClick={() => !isLoading && !isSuccess && setIsEnteringCode(false)}>
      <div className="code-entry-content" onClick={e => e.stopPropagation()}>
        {isSuccess ? (
          <div className="success-message">
            <div className="success-icon">✓</div>
            <h3>Success!</h3>
            <p>Loading your ratings...</p>
          </div>
        ) : (
          <>
            <h3>Enter Your Pizza Code</h3>
            <p>Use this to resume your ratings on a different device</p>
            <div className="code-input-container">
              <input
                type="text"
                value={tempCode}
                onChange={(e) => {
                  setTempCode(e.target.value.toLowerCase());
                  setCodeError('');
                }}
                placeholder="e.g., sauce-owl"
                className={`code-entry-input ${codeError ? 'error' : ''}`}
                disabled={isLoading}
              />
              {codeError && <div className="code-error-message">{codeError}</div>}
            </div>
            <div className="code-entry-buttons">
              <button 
                onClick={handleCodeSubmit}
                disabled={isLoading}
                className="submit-button"
              >
                {isLoading ? 'Checking...' : 'Submit'}
              </button>
              <button 
                onClick={() => {
                  setIsEnteringCode(false);
                  setCodeError('');
                  setTempCode('');
                }}
                disabled={isLoading}
                className="cancel-button"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

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
              (code {userCode})
            </span>
            <button 
              className="code-switch-btn"
              onClick={() => setIsEnteringCode(true)}
              title="Enter a different code"
            >
              <FaKey size={14} />
            </button>
          </div>
        )}
      </div>
      {isEnteringCode && renderCodeEntryModal()}
    </nav>
  );
}

export default NavBar;