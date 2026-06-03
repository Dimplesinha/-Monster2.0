import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      api
        .get('/auth/me')
        .then(({ data }) => setUser(data.user))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  /* ── register ────────────────────────────────────────────────── */
  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    return data; // { message, email }
  };

  /* ── login ───────────────────────────────────────────────────── */
  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    setUser(data.user);
    return data.user;
  };

  /* ── verifyEmail ─────────────────────────────────────────────── */
  const verifyEmail = async (email, code) => {
    const { data } = await api.post('/auth/verify-email', { email, code });
    localStorage.setItem('token', data.token);
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    setUser(data.user);
    return data.user;
  };

  /* ── resendVerification ──────────────────────────────────────── */
  const resendVerification = async (email) => {
    const { data } = await api.post('/auth/resend-verification', { email });
    return data; // { message }
  };

  /* ── refreshUser ─────────────────────────────────────────────── */
  // Re-fetch the current user from /auth/me and update context.
  // Call after any mutation that changes user profile / onboarding state.
  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
      return data.user;
    } catch {
      // token expired or revoked — silently ignore
      return null;
    }
  }, []);

  /* ── logout ──────────────────────────────────────────────────── */
  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, verifyEmail, resendVerification, refreshUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
