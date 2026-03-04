import { createContext, useContext, useState, useCallback } from 'react';
import api from '../api';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  // Used by admin to create a new user account
  const createUser = useCallback(async (username, email, password) => {
    const { data } = await api.post('/auth/register', { username, email, password });
    return data.user;
  }, []);

  // First-time setup: registers the very first (admin) account
  const setupAdmin = useCallback(async (username, email, password) => {
    const { data } = await api.post('/auth/register', { username, email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  // Update avatar URL for the current user
  const updateAvatar = useCallback(async (avatarUrl) => {
    const { data } = await api.patch('/auth/avatar', { avatar_url: avatarUrl });
    const updated = { ...JSON.parse(localStorage.getItem('user')), avatar: data.avatar };
    localStorage.setItem('user', JSON.stringify(updated));
    setUser(updated);
    return updated;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  return (
    <AuthCtx.Provider value={{ user, login, createUser, setupAdmin, updateAvatar, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
