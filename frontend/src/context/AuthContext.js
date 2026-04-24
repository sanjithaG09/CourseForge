import React, { createContext, useContext, useState, useCallback } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cf_user')); } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem('cf_token'));
  const [loading, setLoading] = useState(false);

  const _persist = (t, role, name) => {
    const userData = { name, role };
    localStorage.setItem('cf_token', t);
    localStorage.setItem('cf_user', JSON.stringify(userData));
    setToken(t);
    setUser(userData);
    return userData;
  };

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    return _persist(res.data.token, res.data.role, res.data.name);
  };

  const googleLogin = async (credential) => {
    const res = await authAPI.googleAuth({ credential });
    return _persist(res.data.token, res.data.role, res.data.name);
  };

  // Returns { requiresOTP, email } or throws
  const signup = async (name, email, password, role = 'student') => {
    const res = await authAPI.signup({ name, email, password, role });
    return res.data; // { requiresOTP: true, email }
  };

  const verifySignupOTP = async (email, otp) => {
    const res = await authAPI.verifySignupOTP({ email, otp });
    return _persist(res.data.token, res.data.role, res.data.name);
  };

  const resendSignupOTP = async (email) => {
    const res = await authAPI.resendSignupOTP({ email });
    return res.data;
  };

  const logout = async () => {
    try { await authAPI.logout(); } catch {}
    localStorage.removeItem('cf_token');
    localStorage.removeItem('cf_user');
    setToken(null);
    setUser(null);
  };

  const refreshProfile = useCallback(async () => {
    if (!token) return;
    try {
      const res = await authAPI.getProfile();
      const updated = { name: res.data.name, role: res.data.role };
      setUser(updated);
      localStorage.setItem('cf_user', JSON.stringify(updated));
    } catch {}
  }, [token]);

  const isInstructor = user?.role === 'instructor' || user?.role === 'admin';
  const isAdmin = user?.role === 'admin';
  const isLoggedIn = !!token;

  return (
    <AuthContext.Provider value={{
      user, token, loading, isLoggedIn, isInstructor, isAdmin,
      login, googleLogin, signup, verifySignupOTP, resendSignupOTP,
      logout, refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
