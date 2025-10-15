import React, { createContext, useContext, useState, ReactNode } from 'react';
import { supabase } from '../utils/supabase';

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
      // Check if Supabase is available
      if (!supabase) {
        console.warn('Supabase not available, using fallback authentication');
        // Fallback for development - accept any password for now
        if (username === 'shaktiadmin' && password.length > 0) {
          setUser({ id: 'fallback-' + Date.now(), name: username, role });
          return;
        }
        throw new Error('Authentication service unavailable');
      }

      // First, check if user exists and account is active
      const { data: userData, error: userError } = await supabase
        .from('superadmin_users')
        .select('*')
        .eq('username', username)
        .eq('is_active', true)
        .single();

      if (userError) {
        console.error('Database query error:', userError);
        // Fallback: if database is not available, allow development login
        if (username === 'shaktiadmin' && password === 'Arqpn2492n') {
          setUser({ id: 'dev-' + Date.now(), name: username, role });
          return;
        }
        throw new Error('Invalid username or account inactive');
      }

      if (!userData) {
        throw new Error('Invalid username or account inactive');
      }

      // Verify password against password_hash field
      if (userData.password_hash !== password) {
        // Increment failed login attempts
        try {
          await supabase
            .from('superadmin_users')
            .update({
              login_attempts: (userData.login_attempts || 0) + 1,
              locked_until: (userData.login_attempts || 0) >= 4 ?
                new Date(Date.now() + 15 * 60 * 1000).toISOString() : // Lock for 15 minutes after 5 failed attempts
                userData.locked_until
            })
            .eq('id', userData.id);
        } catch (updateError) {
          console.error('Failed to update login attempts:', updateError);
        }

        throw new Error('Invalid password');
      }

      // Check if account is locked
      if (userData.locked_until && new Date(userData.locked_until) > new Date()) {
        throw new Error('Account temporarily locked due to multiple failed login attempts');
      }

      // Verify role matches
      if (userData.role !== role) {
        throw new Error(`Access denied. Required role: ${userData.role}`);
      }

      // Reset login attempts on successful login
      try {
        await supabase
          .from('superadmin_users')
          .update({
            login_attempts: 0,
            locked_until: null,
            last_login: new Date().toISOString()
          })
          .eq('id', userData.id);
      } catch (updateError) {
        console.error('Failed to reset login attempts:', updateError);
      }

      // Set user state with the database record
      setUser({
        id: userData.id,
        name: userData.username,
        role: userData.role
      });
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