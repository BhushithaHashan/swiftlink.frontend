import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  authApi, 
  setAccessToken, 
  setRefreshToken, 
  getRefreshToken, 
  clearTokens,
  getAccessToken 
} from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface User {
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const decodeToken = (token: string): User | null => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return { email: payload.email || payload.sub };
    } catch {
      return null;
    }
  };

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore errors during logout
    } finally {
      clearTokens();
      setUser(null);
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        try {
          const response = await authApi.refresh();
          setAccessToken(response.accessToken);
          setRefreshToken(response.refreshToken);
          const decoded = decodeToken(response.accessToken);
          setUser(decoded);
        } catch {
          clearTokens();
        }
      }
      setIsLoading(false);
    };

    initAuth();

    // Listen for forced logout events
    const handleLogout = () => {
      setUser(null);
      toast({
        title: 'Session expired',
        description: 'Please log in again.',
        variant: 'destructive',
      });
    };

    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, [toast]);

  const login = async (email: string, password: string) => {
    const response = await authApi.login(email, password);
    setAccessToken(response.accessToken);
    setRefreshToken(response.refreshToken);
    const decoded = decodeToken(response.accessToken);
    setUser(decoded);
    toast({
      title: 'Welcome back!',
      description: 'You have successfully logged in.',
    });
  };

  const register = async (email: string, password: string) => {
    const response = await authApi.register(email, password);
    setAccessToken(response.accessToken);
    setRefreshToken(response.refreshToken);
    const decoded = decodeToken(response.accessToken);
    setUser(decoded);
    toast({
      title: 'Account created!',
      description: 'Welcome to SwiftLink.',
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
