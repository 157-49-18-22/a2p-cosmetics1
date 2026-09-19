import React, { createContext, useContext, useState, useEffect } from 'react';
import API_BASE_URL from '../apiConfig.js';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('a2p_user') || localStorage.getItem('active_dealer');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  const [loading, setLoading]         = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // On mount: restore session from HttpOnly JWT cookie or localStorage
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const authResponse = await fetch(`${API_BASE_URL}/auth/me`, { credentials: 'include' });
        if (authResponse.ok) {
          const userData = await authResponse.json();
          if (userData && typeof userData === 'object' && !userData.error) {
            setUser(userData);
            try {
              localStorage.setItem('a2p_user', JSON.stringify(userData));
            } catch (e) {}
            setLoading(false);
            return;
          }
        }
      } catch (error) {
        console.error('Error restoring session from API:', error);
      }

      // Fallback: Check for stored user in localStorage
      try {
        const savedUser = localStorage.getItem('a2p_user') || localStorage.getItem('active_dealer');
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          setUser(parsed);
        }
      } catch (e) {
        console.error('Error parsing stored user data:', e);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = (userData) => {
    if (!userData) return;
    setUser(userData);
    setShowLoginModal(false);
    try {
      localStorage.setItem('a2p_user', JSON.stringify(userData));
      if (userData.role === 'Dealer' || userData.type === 'dealer') {
        localStorage.setItem('active_dealer', JSON.stringify(userData));
      }
    } catch (e) {}
  };

  const logout = async (redirectTo) => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch (e) {
      console.error('Logout error:', e);
    }
    try {
      localStorage.removeItem('a2p_user');
      localStorage.removeItem('active_dealer');
    } catch (e) {}
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

