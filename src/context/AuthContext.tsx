import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Member } from '../types';
import { db } from '../services/db/mockDatabase';

interface AuthContextType {
  user: User | null;
  member: Member | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updatePassword: (oldPass: string, newPass: string) => { success: boolean; error?: string };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'sms_auth_user';
const TOKEN_STORAGE_KEY = 'sms_auth_token';
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5001' : '');

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [member, setMember] = useState<Member | null>(null);

  useEffect(() => {
    if (user && user.role === 'MEMBER' && user.member_id) {
      const m = db.getMemberById(user.member_id);
      setMember(m || null);
    } else {
      setMember(null);
    }
  }, [user]);

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (!response.ok) return { success: false, error: data.error || 'Invalid credentials' };

      setUser(data.user);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data.user));
      localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
      return { success: true };
    } catch {
      return { success: false, error: 'Unable to reach the authentication server.' };
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await response.json();
      return response.ok ? { success: true } : { success: false, error: data.error || 'Registration failed' };
    } catch {
      return { success: false, error: 'Unable to reach the authentication server.' };
    }
  };

  const logout = () => {
    setUser(null);
    setMember(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  };

  const updatePassword = (oldPass: string, newPass: string) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    if (user.password_hash !== oldPass) {
      return { success: false, error: 'Current password does not match' };
    }

    const users = db.getUsers();
    const target = users.find((u) => u.id === user.id);
    if (target) {
      target.password_hash = newPass;
      localStorage.setItem('sms_db_users', JSON.stringify(users));
      setUser({ ...user, password_hash: newPass });
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ ...user, password_hash: newPass }));
      return { success: true };
    }

    return { success: false, error: 'User record not found' };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        member,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
