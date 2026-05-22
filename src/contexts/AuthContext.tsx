import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, LoginInput, RegisterInput } from '../types';
import { authAPI } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginInput) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!storedToken || !storedUser) {
      setIsLoading(false);
      return;
    }

    setToken(storedToken);
    setUser(JSON.parse(storedUser));

    try {
      const response = await authAPI.getMe();
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (data: LoginInput) => {
    const response = await authAPI.login(data);
    if (response.success && response.data) {
      const { user: userData, token: authToken } = response.data;
      setUser(userData);
      setToken(authToken);
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(userData));
    } else {
      throw new Error(response.message || 'Login failed');
    }
  };

  const register = async (data: RegisterInput) => {
    const response = await authAPI.register(data);
    if (response.success && response.data) {
      const { user: userData, token: authToken } = response.data;
      setUser(userData);
      setToken(authToken);
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(userData));
    } else {
      throw new Error(response.message || 'Registration failed');
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch {
      // Ignore logout errors
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;