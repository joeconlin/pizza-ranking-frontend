// contexts/UserContext.js
import React, { createContext, useState, useEffect } from 'react';
import { API_URL } from '../config';

const adjectives = ['RED', 'BLUE', 'FAST', 'COOL', 'HOT', 'BIG', 'TINY', 'WILD'];
const nouns = ['DOG', 'CAT', 'FOX', 'BEAR', 'WOLF', 'LION', 'HAWK', 'STAR'];

const generateUserCode = () => {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `PIZZA-${adj}-${noun}`;
};

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userName, setUserName] = useState('');
  const [clientUID, setClientUID] = useState('');
  const [userCode, setUserCode] = useState('');
  const [showCodeEntry, setShowCodeEntry] = useState(false);

  useEffect(() => {
    // Check for existing ID and code
    let uid = localStorage.getItem('clientUID');
    let code = localStorage.getItem('userCode');
    
    if (!uid) {
      uid = crypto.randomUUID();
      code = generateUserCode();
      localStorage.setItem('clientUID', uid);
      localStorage.setItem('userCode', code);
    }
    
    setClientUID(uid);
    setUserCode(code);

    // Fetch username as before
    const fetchOrCreateUsername = async () => {
      try {
        const response = await fetch(`${API_URL}/get-username`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clientUID: uid }),
        });
    
        if (response.ok) {
          const data = await response.json();
          // Only set the userName if we got one back from the server
          if (data.userName) {
            setUserName(data.userName);
          } else {
            setUserName('Click to Edit Name'); // Just for display, won't be stored
          }
        }
      } catch (error) {
        console.error('Error fetching username:', error);
      }
    };

    fetchOrCreateUsername();
  }, []);

  return (
    <UserContext.Provider value={{ 
      userName, 
      setUserName, 
      clientUID,
      userCode,
      showCodeEntry,
      setShowCodeEntry
    }}>
      {children}
    </UserContext.Provider>
  );
};