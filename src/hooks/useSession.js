/**
 * useSession — reads the current logged-in user from the JWT HttpOnly cookie
 * via /api/auth/me. Nothing is stored in localStorage.
 *
 * Usage:
 *   const { user, loading } = useSession();
 *   // user.id, user.role, user.type, user.name, user.email …
 */
import { useState, useEffect } from 'react';
import API_BASE_URL from '../apiConfig.js';

const cache = { user: null, fetched: false };

export const useSession = () => {
  const [user, setUser]       = useState(cache.user);
  const [loading, setLoading] = useState(!cache.fetched);

  useEffect(() => {
    if (cache.fetched) return;
    fetch(`${API_BASE_URL}/auth/me`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        cache.user    = data;
        cache.fetched = true;
        setUser(data);
      })
      .catch(() => { cache.fetched = true; })
      .finally(() => setLoading(false));
  }, []);

  return { user, loading };
};
