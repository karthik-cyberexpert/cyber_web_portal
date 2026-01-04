import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState, getStoredAuth, setStoredAuth, clearStoredAuth, getRoleDashboardPath } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '@/lib/api-config';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  requiresPasswordChange: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  setRequiresPasswordChange: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({ user: null, isAuthenticated: false });
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [requiresPasswordChange, setRequiresPasswordChange] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for stored auth on mount
    const stored = getStoredAuth();
    const storedToken = localStorage.getItem('token');
    setAuthState(stored);
    setToken(storedToken);
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        setStoredAuth({ user: data.user, isAuthenticated: true });
        setAuthState({ user: data.user, isAuthenticated: true });
        localStorage.setItem('token', data.token);
        setToken(data.token);
        
        // Check if password change is required
        if (data.requiresPasswordChange) {
          setRequiresPasswordChange(true);
          navigate('/set-password');
        } else {
          const dashboardPath = getRoleDashboardPath(data.user.role);
          navigate(dashboardPath);
        }
        
        setIsLoading(false);
        return { success: true };
      } else {
        setIsLoading(false);
        return { success: false, error: data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login API error:', error);
      setIsLoading(false);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const logout = () => {
    clearStoredAuth();
    localStorage.removeItem('token');
    setAuthState({ user: null, isAuthenticated: false });
    setToken(null);
    setRequiresPasswordChange(false);
    navigate('/login');
  };

  const updateUser = (data: Partial<User>) => {
    if (authState.user) {
      const updatedUser = { ...authState.user, ...data };
      const updatedState = { ...authState, user: updatedUser };
      setStoredAuth(updatedState);
      setAuthState(updatedState);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: authState.user,
        isAuthenticated: authState.isAuthenticated,
        isLoading,
        token,
        requiresPasswordChange,
        login,
        logout,
        updateUser,
        setRequiresPasswordChange,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

