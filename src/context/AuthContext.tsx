import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, CompanyId } from '../types';
import { apiRequest, setApiAuthToken } from '../services/api/apiClient';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (company: CompanyId, username: string, password?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Auto login demo CBE Staff user initially for immediate dev accessibility if desired
    // (can be cleared anytime via logout)
    login('CBE', 'admin_cbe', 'Password@123').finally(() => {
      setIsLoading(false);
    });
  }, []);

  const login = async (company: CompanyId, username: string, password = 'Password@123'): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiRequest<{ token: string; user: User }>('login', {
        company,
        username,
        password,
      });

      if (res.success && res.data) {
        setUser(res.data.user);
        setToken(res.data.token);
        setApiAuthToken(res.data.token);
        setIsLoading(false);
        return true;
      } else {
        setError(res.message || 'Login failed. Please check credentials.');
        setIsLoading(false);
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected authentication error occurred.');
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await apiRequest('logout');
    } catch {
      // Ignore
    } finally {
      setUser(null);
      setToken(null);
      setApiAuthToken(null);
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        logout,
        clearError,
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
