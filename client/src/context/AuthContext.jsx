import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('nexevent_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('nexevent_token') || null;
  });

  const [savedEvents, setSavedEvents] = useState(() => {
    try {
      const saved = localStorage.getItem('nexevent_saved_events');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('nexevent_token');
    localStorage.removeItem('nexevent_user');
  }, []);

  // Sync session on mount
  useEffect(() => {
    async function verifySession() {
      if (token) {
        try {
          const res = await api.getMe(token);
          if (res.user) {
            setUser(res.user);
            localStorage.setItem('nexevent_user', JSON.stringify(res.user));
          }
        } catch (err) {
          console.warn('Session verification error:', err.message);
          // If token invalid or expired, clear cleanly
          logout();
        }
      }
      setLoading(false);
    }
    verifySession();
  }, [token, logout]);

  // Save bookmarked events
  useEffect(() => {
    localStorage.setItem('nexevent_saved_events', JSON.stringify(savedEvents));
  }, [savedEvents]);

  const toggleSaveEvent = (eventId) => {
    setSavedEvents(prev => {
      if (prev.includes(eventId)) {
        return prev.filter(id => id !== eventId);
      } else {
        return [...prev, eventId];
      }
    });
  };

  const login = async (email, password) => {
    const data = await api.login(email, password);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('nexevent_token', data.token);
    localStorage.setItem('nexevent_user', JSON.stringify(data.user));
    return data;
  };

  const register = async (studentData) => {
    const data = await api.register(studentData);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('nexevent_token', data.token);
    localStorage.setItem('nexevent_user', JSON.stringify(data.user));
    return data;
  };


  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAdmin: user?.role === 'admin',
    isVolunteer: user?.role === 'volunteer',
    isStudent: user?.role === 'student' || (!user?.role || (user?.role !== 'admin' && user?.role !== 'volunteer')),
    savedEvents,
    toggleSaveEvent
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
