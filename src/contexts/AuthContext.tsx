import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { User, AuthState, getStoredAuth, setStoredAuth, clearStoredAuth, getRoleDashboardPath } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '@/lib/api-config';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  requiresPasswordChange: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: (credential: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  setRequiresPasswordChange: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes
const HEARTBEAT_INTERVAL = 5 * 1000; // 5 seconds (Reduced for faster security response)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({ user: null, isAuthenticated: false });
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [requiresPasswordChange, setRequiresPasswordChange] = useState(false);
  const [sessionError, setSessionError] = useState<{ title: string; message: string } | null>(null);
  
  // Use a ref for the token to always have the latest value in event listeners
  const tokenRef = useRef<string | null>(null);
  const navigate = useNavigate();

  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimerRef = useRef<NodeJS.Timeout | null>(null);

  const logout = React.useCallback(() => {
    console.log('[AUTH] Logging out user and clearing session');
    clearStoredAuth();
    localStorage.removeItem('token');
    setAuthState({ user: null, isAuthenticated: false });
    setToken(null);
    tokenRef.current = null;
    setRequiresPasswordChange(false);
    
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);
    
    navigate('/login');
  }, [navigate]);

  const resetInactivityTimer = React.useCallback(() => {
    if (!authState.isAuthenticated) return;

    if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
    }

    inactivityTimerRef.current = setTimeout(() => {
        console.warn('[AUTH] Session timed out due to inactivity');
        setSessionError({
            title: "Session Expired",
            message: "You have been logged out due to 15 minutes of inactivity. Please log in again to continue."
        });
        logout();
    }, INACTIVITY_TIMEOUT);
  }, [authState.isAuthenticated, logout]);

  const checkSession = React.useCallback(async () => {
    const currentToken = tokenRef.current;
    if (!authState.isAuthenticated || !currentToken) return;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/check-session`, {
            headers: { 'Authorization': `Bearer ${currentToken}` }
        });

        if (!response.ok) {
            const data = await response.json();
            if (data.code === 'ANOTHER_DEVICE_LOGGED_IN' || response.status === 401) {
                console.error('[AUTH] Multi-session detected or session invalid');
                setSessionError({
                    title: "Security Alert",
                    message: "Someone else logged in to this account from a different session. You have been automatically logged out for your security."
                });
                logout();
            }
        }
    } catch (err) {
        console.error('[AUTH] Heartbeat error:', err);
    }
  }, [authState.isAuthenticated, logout]);

  useEffect(() => {
    // Check for stored auth on mount
    const stored = getStoredAuth();
    const storedToken = localStorage.getItem('token');
    setAuthState(stored);
    setToken(storedToken);
    tokenRef.current = storedToken;
    setRequiresPasswordChange(!!stored.requiresPasswordChange);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (authState.isAuthenticated) {
        // Activity listeners
        const events = ['mousemove', 'mousedown', 'keypress', 'touchstart', 'scroll'];
        events.forEach(event => window.addEventListener(event, resetInactivityTimer));
        
        // Immediate check on focus or storage change (another tab login/logout)
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'token') {
                if (!e.newValue) {
                    console.log('[AUTH] Token removed in another tab, logging out...');
                    logout();
                } else {
                    console.log('[AUTH] Token changed in another tab, verifying current session...');
                    checkSession();
                }
            }
        };

        const handleFocus = () => {
             console.log('[AUTH] Tab focused, checking session...');
             checkSession();
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('focus', handleFocus);
        
        // Initial setup
        resetInactivityTimer();
        
        // Heartbeat setup
        heartbeatTimerRef.current = setInterval(checkSession, HEARTBEAT_INTERVAL);

        return () => {
            events.forEach(event => window.removeEventListener(event, resetInactivityTimer));
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('focus', handleFocus);
            if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
            if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);
        };
    }
  }, [authState.isAuthenticated, resetInactivityTimer, checkSession]);

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
        setStoredAuth({ 
          user: data.user, 
          isAuthenticated: true, 
          requiresPasswordChange: !!data.requiresPasswordChange 
        });
        setAuthState({ 
          user: data.user, 
          isAuthenticated: true,
          requiresPasswordChange: !!data.requiresPasswordChange
        });
        localStorage.setItem('token', data.token);
        setToken(data.token);
        tokenRef.current = data.token;
        
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

  const loginWithGoogle = async (credential: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credential })
      });

      const data = await response.json();

      if (response.ok) {
        setStoredAuth({ 
          user: data.user, 
          isAuthenticated: true, 
          requiresPasswordChange: false 
        });
        setAuthState({ 
          user: data.user, 
          isAuthenticated: true,
          requiresPasswordChange: false
        });
        localStorage.setItem('token', data.token);
        setToken(data.token);
        tokenRef.current = data.token;
        
        const dashboardPath = getRoleDashboardPath(data.user.role);
        navigate(dashboardPath);
        
        setIsLoading(false);
        return { success: true };
      } else {
        setIsLoading(false);
        return { success: false, error: data.message || 'Google login failed' };
      }
    } catch (error) {
      console.error('Google Login API error:', error);
      setIsLoading(false);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const updateUser = (data: Partial<User>) => {
    if (authState.user) {
      const updatedUser = { ...authState.user, ...data };
      const updatedState = { ...authState, user: updatedUser };
      setStoredAuth(updatedState);
      setAuthState(updatedState);
    }
  };

  const setRequiresPasswordChangePersistent = (value: boolean) => {
    setRequiresPasswordChange(value);
    if (authState.isAuthenticated) {
      const updatedState = { ...authState, requiresPasswordChange: value };
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
        loginWithGoogle,
        logout,
        updateUser,
        setRequiresPasswordChange: setRequiresPasswordChangePersistent,
      }}
    >
      {children}
      
      {/* Session Error Notification */}
      <AlertDialog open={!!sessionError} onOpenChange={(open) => !open && setSessionError(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
                <span className="text-destructive font-bold">!</span> {sessionError?.title}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {sessionError?.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => {
                setSessionError(null);
                navigate('/login');
            }}>
                Log In Again
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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

