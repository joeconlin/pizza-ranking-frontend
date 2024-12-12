import React, { createContext, useState, useEffect } from 'react';
import { API_URL } from '../config';

console.log('API URL being used:', API_URL);

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userName, setUserName] = useState('');
  const [clientUID, setClientUID] = useState('');

  useEffect(() => {
    // Check if a UID exists in localStorage; otherwise, generate a new one
    let uid = localStorage.getItem('clientUID');
    if (!uid) {
      uid = crypto.randomUUID();
      localStorage.setItem('clientUID', uid);
    }
    setClientUID(uid);

    // Fetch or create username for the UID
    const fetchOrCreateUsername = async () => {
      try {
        const response = await fetch(`${API_URL}/get-username`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clientUID: uid }),
        });

        if (response.ok) {
          const data = await response.json();
          setUserName(data.userName || 'Click to Edit Name');
        } else {
          console.error('Failed to fetch username');
        }
      } catch (error) {
        console.error('Error fetching username:', error.message);
      }
    };

    fetchOrCreateUsername();
  }, []);

  const updateUserName = (newName) => {
    setUserName(newName);
    localStorage.setItem('userName', newName); // Save locally

    // Update UID-to-Username mapping in Google Sheets
    fetch(`${API_URL}/set-name`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientUID, userName: newName }),
    }).catch((error) => console.error('Error updating username:', error.message));
  };

  return (
    <UserContext.Provider value={{ userName, setUserName: updateUserName, clientUID }}>
      {children}
    </UserContext.Provider>
  );
};