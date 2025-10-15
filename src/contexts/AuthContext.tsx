import React, { createContext, useContext, useState, ReactNode } from 'react';
import { loginSuperAdmin } from '../services/authService';

interface User {
  id: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string, role: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (username: string, password: string, role: string) => {
    try {
      if (role === 'SuperAdmin') {
        const authenticatedUser = await loginSuperAdmin({ username, password });
        setUser({
          id: authenticatedUser.id,
          name: authenticatedUser.username,
          role: role
        });
        return;
      }

      if (username && password && role) {
        setUser({
          id: 'user-' + Date.now(),
          name: username,
          role: role
        });
        return;
      }

      throw new Error('Invalid credentials');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};