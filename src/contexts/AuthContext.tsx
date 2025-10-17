import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { loginSuperAdmin, loginCompanyAdmin, loginEmployee } from '../services/authService';
import { getTenantBySubdomain, extractSubdomain } from '../utils/tenantDetection';

interface User {
  id: string;
  name: string;
  role: string;
  tenantId?: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string, role: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'shakti_user_session';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    }
  }, []);

  const login = async (username: string, password: string, role: string) => {
    try {
      if (role === 'SuperAdmin') {
        const authenticatedUser = await loginSuperAdmin({ username, password });
        const userData = {
          id: authenticatedUser.id,
          name: authenticatedUser.username,
          role: role
        };
        setUser(userData);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
        return;
      }

      const hostname = window.location.hostname;
      const subdomain = extractSubdomain(hostname);

      if (!subdomain) {
        throw new Error('Please access from your company subdomain (e.g., yourcompany.example.com)');
      }

      const tenant = await getTenantBySubdomain(subdomain);
      if (!tenant) {
        throw new Error('Company not found. Please check your subdomain.');
      }

      if (tenant.status !== 'active') {
        throw new Error('This company account is currently inactive. Please contact support.');
      }

      if (role === 'CompanyAdmin') {
        const authenticatedUser = await loginCompanyAdmin({ username, password }, tenant.id);
        const userData = {
          id: authenticatedUser.id,
          name: authenticatedUser.name || authenticatedUser.username,
          role: role,
          tenantId: authenticatedUser.tenantId,
          email: authenticatedUser.email
        };
        setUser(userData);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
        return;
      }

      if (role === 'TeamIncharge' || role === 'Telecaller') {
        const authenticatedUser = await loginEmployee({ identifier: username, password }, tenant.id);
        const userData = {
          id: authenticatedUser.id,
          name: authenticatedUser.name || authenticatedUser.username,
          role: authenticatedUser.role || role,
          tenantId: authenticatedUser.tenantId,
          email: authenticatedUser.email
        };
        setUser(userData);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
        return;
      }

      throw new Error('Invalid role');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
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