'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

interface User {
  userId: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  roles?: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        // Sync to Zustand useAuthStore on startup
        const storeLogin = useAuthStore.getState().login;
        storeLogin({
          id: parsedUser.userId || parsedUser.id || 'unknown',
          email: parsedUser.email,
          firstName: parsedUser.firstName || 'User',
          lastName: parsedUser.lastName || '',
          roles: parsedUser.roles || [parsedUser.role || 'USER']
        }, storedToken);
      } catch (e) {
        console.error('Failed to parse user from local storage', e);
      }
    }
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    
    // Sync to Zustand useAuthStore
    const storeLogin = useAuthStore.getState().login;
    storeLogin({
      id: newUser.userId || 'unknown',
      email: newUser.email,
      firstName: newUser.firstName || 'User',
      lastName: newUser.lastName || '',
      roles: newUser.roles || [newUser.role || 'USER']
    }, newToken);

    // Redirect immediately based on user role
    const finalRole = newUser.role || newUser.roles?.[0] || 'USER';
    if (finalRole === 'SUPER_ADMIN' || finalRole === 'ADMIN') {
      router.push('/admin');
    } else {
      router.push('/dashboard');
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Sync to Zustand useAuthStore
    const storeLogout = useAuthStore.getState().logout;
    storeLogout();

    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
