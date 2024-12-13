// contexts/UserContext.js
import React, { createContext, useState, useEffect } from 'react';
import { API_URL } from '../config';

const pizzaWords = [
  'pizza', 'slice', 'crust', 'sauce', 'cheese', 
  'mozz', 'parm', 'dough', 'fresh', 'crisp',
  'bite', 'hot', 'steam', 'brick', 'wood',
  'fire', 'spice', 'herb', 'oil', 'red',
  'basil', 'garlic', 'toast', 'bake'
];

const animals = [
  'dog', 'cat', 'fox', 'bear', 'wolf', 'lion', 'hawk', 'owl',
  'seal', 'deer', 'goat', 'bird', 'duck', 'crow', 'frog',
  'newt', 'hare', 'lynx', 'puma', 'deer'
];

const generateUserCode = () => {
  const pizzaWord = pizzaWords[Math.floor(Math.random() * pizzaWords.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  return `${pizzaWord}-${animal}`;
};

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userName, setUserName] = useState('');
  const [userCode, setUserCode] = useState('');

  useEffect(() => {
    // Check for existing code
    let code = localStorage.getItem('userCode');
    
    if (!code) {
      code = generateUserCode();
      localStorage.setItem('userCode', code);
    }
    
    setUserCode(code);

    // Fetch username if exists
    const fetchUsername = async () => {
      try {
        const response = await fetch(`${API_URL}/get-username`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userCode: code }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.userName) {
            setUserName(data.userName);
          }
        }
      } catch (error) {
        console.error('Error fetching username:', error);
      }
    };

    fetchUsername();
  }, []);

  return (
    <UserContext.Provider value={{ 
      userName, 
      setUserName, 
      userCode
    }}>
      {children}
    </UserContext.Provider>
  );
};