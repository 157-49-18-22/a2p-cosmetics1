/**
 * useSession — reads the current logged-in user from API or localStorage
 *
 * Usage:
 *   const { user, loading } = useSession();
 *   // user.id, user.role, user.type, user.name, user.email …
 */
import { useState, useEffect } from 'react';
import API_BASE_URL from '../apiConfig.js';

const getStoredUser = () => {
  try {
    const saved = localStorage.getItem('a2p_user') || localStorage.getItem('active_dealer');
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    return null;
  }
};

const cache = { user: getStoredUser(), fetched: false };

export const useSession = () => {
  const [user, setUser]       = useState(() => cache.user || getStoredUser());
  const [loading, setLoading] = useState(!cache.fetched);

  useEffect(() => {
    if (cache.fetched && cache.user) {
      setLoading(false);
      return;
    }
    fetch(`${API_BASE_URL}/auth/me`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data && typeof data === 'object' && !data.error) {
          cache.user    = data;
          cache.fetched = true;
          setUser(data);
          try {
            localStorage.setItem('a2p_user', JSON.stringify(data));
          } catch (e) {}
        } else {
          const localUser = getStoredUser();
          if (localUser) {
            cache.user = localUser;
            setUser(localUser);
          }
          cache.fetched = true;
        }
      })
      .catch(() => {
        const localUser = getStoredUser();
        if (localUser) {
          cache.user = localUser;
          setUser(localUser);
        }
        cache.fetched = true;
      })
      .finally(() => setLoading(false));
  }, []);

  return { user, loading };
};

