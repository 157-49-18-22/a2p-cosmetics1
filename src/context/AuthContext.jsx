import React, { createContext, useContext, useState, useEffect } from 'react';
import API_BASE_URL from '../apiConfig.js';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // On mount: restore session from HttpOnly JWT cookie and localStorage for dealers
  useEffect(() => {
    const restoreSession = async () => {
      try {
        // First try to restore from auth endpoint
        const authResponse = await fetch(`${API_BASE_URL}/auth/me`, { credentials: 'include' });
        if (authResponse.ok) {
          const userData = await authResponse.json();
          if (userData) {
            setUser(userData);
            setLoading(false);
            return;
          }
        }

        // Fallback: Check for dealer data in localStorage
        const dealerData = localStorage.getItem('active_dealer');
        if (dealerData) {
          const parsedDealer = JSON.parse(dealerData);
          setUser(parsedDealer);
        }
      } catch (error) {
        console.error('Error restoring session:', error);
        
        // Fallback to localStorage if API fails
        const dealerData = localStorage.getItem('active_dealer');
        if (dealerData) {
          try {
            const parsedDealer = JSON.parse(dealerData);
            setUser(parsedDealer);
          } catch (e) {
            console.error('Error parsing dealer data:', e);
            localStorage.removeItem('active_dealer');
          }
        }
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = (userData) => {
    // userData comes from login API response (safe payload, no password)
    setUser(userData);
    setShowLoginModal(false);
  };

  const logout = async (redirectTo) => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch (e) {
      console.error('Logout error:', e);
    }
    localStorage.removeItem('active_dealer');
    setUser(null);

    if (redirectTo) {
      window.location.href = redirectTo;
      return;
    }

    const currentPath = window.location.pathname.toLowerCase();
    if (
      currentPath.startsWith('/distributor') || 
      currentPath.startsWith('/dealer') || 
      currentPath.startsWith('/agent')
    ) {
      window.location.href = '/distributor/login';
    } else {
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, showLoginModal, setShowLoginModal }}>
      {children}
    </AuthContext.Provider>
  );
};
