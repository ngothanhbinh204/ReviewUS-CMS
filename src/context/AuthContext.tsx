import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { authApi } from '../services/api';
import { USE_MOCK_API } from '../services/mockApi';
import { mockUser } from '../services/mockData';

interface User {
  id: string;
  email: string;
  displayName: string;
  roles: string[];
  permissions: string[];
  current_tenant_id?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'SET_CURRENT_TENANT'; payload: string };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true, error: null };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'SET_CURRENT_TENANT':
      return {
        ...state,
        user: state.user ? { ...state.user, current_tenant_id: action.payload } : null,
      };
    default:
      return state;
  }
};


interface Tenant {
  id: string;
  slug: string;
  domain: string;
  createdAt: string;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setCurrentTenant: (tenantId: string) => void;
  updateAccessToken: (accessToken: string) => void;
  currentTenant: Tenant | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    console.error('useAuth called outside of AuthProvider context');
    console.trace(); // This will show the call stack
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [currentTenant, setCurrentTenantState] = React.useState<Tenant | null>(null);

  // Helper to get tenant from localStorage
  const getCurrentTenantFromStorage = (): Tenant | null => {
    // Support both keys used across the app: 'current_tenant' (tenantService) and 'currentTenant' (older code)
    const tenantStr = localStorage.getItem('currentTenant') || localStorage.getItem('current_tenant');
    if (tenantStr) {
      try {
        return JSON.parse(tenantStr);
      } catch {
        return null;
      }
    }
    return null;
  };

  // Initialize auth state from localStorage (restore session on reload)
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          // In mock mode, use mock user
          if (USE_MOCK_API) {
            const mockUserData = {
              ...mockUser,
              displayName: (mockUser as any).name,
              roles: [(mockUser as any).role],
              permissions: []
            } as unknown as User;
            dispatch({ type: 'AUTH_SUCCESS', payload: mockUserData });
            return;
          }

          // Verify token expiry
          try {
            const tokenPayload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Date.now() / 1000;
            if (tokenPayload.exp && tokenPayload.exp > currentTime) {
              const user = JSON.parse(savedUser) as User;
              dispatch({ type: 'AUTH_SUCCESS', payload: user });
            } else {
              // Token expired
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              dispatch({ type: 'AUTH_ERROR', payload: 'Session expired' });
            }
          } catch (jwtError) {
            console.error('JWT decode error during init:', jwtError);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            dispatch({ type: 'AUTH_ERROR', payload: 'Invalid session' });
          }
        } catch (e) {
          console.error('Failed to restore session:', e);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          dispatch({ type: 'AUTH_ERROR', payload: 'Session error' });
        }
      } else {
        // Not authenticated
        dispatch({ type: 'AUTH_ERROR', payload: '' });
      }
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    // Sync currentTenant from localStorage on mount
    setCurrentTenantState(getCurrentTenantFromStorage());
  }, []);

  useEffect(() => {
    // Listen for tenant changes in localStorage (multi-tab)
    const onStorage = (e: StorageEvent) => {
      if (!e.key) return;
      // react to either key
      if (e.key === 'currentTenant' || e.key === 'current_tenant' || e.key === 'current_tenant_id' || e.key === 'current_tenant_slug') {
        setCurrentTenantState(getCurrentTenantFromStorage());
      }
      // If user or token changed in another tab, update auth state
      if (e.key === 'user' || e.key === 'token') {
        // Re-run initializeAuth logic by reloading the page or updating state
        // Here we'll attempt to restore from storage
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        if (token && savedUser) {
          try {
            const user = JSON.parse(savedUser) as User;
            dispatch({ type: 'AUTH_SUCCESS', payload: user });
          } catch {
            dispatch({ type: 'AUTH_ERROR', payload: 'Invalid session' });
          }
        } else {
          dispatch({ type: 'AUTH_ERROR', payload: '' });
        }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Also update currentTenant state when updateAccessToken or setCurrentTenant is called

  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: 'AUTH_START' });
      console.log('Attempting login with:', { email });
      
      const response = await authApi.login({ email, password });
      console.log('Login response:', response);
      
      // Handle nested response structure: response.data.data
      const loginData = response.data?.data || response.data;
      const { accessToken, user } = loginData;
      
      if (!accessToken || !user) {
        throw new Error('Invalid response structure');
      }
      
      // Extract tenant ID from JWT token
      try {
        const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]));
        console.log('Token payload:', tokenPayload);
        
        const userWithTenant = {
          ...user,
          current_tenant_id: tokenPayload.tenantId
        };
        
        localStorage.setItem('token', accessToken);
        localStorage.setItem('user', JSON.stringify(userWithTenant));
        
        dispatch({ type: 'AUTH_SUCCESS', payload: userWithTenant });
      } catch (jwtError) {
        console.error('JWT decode error:', jwtError);
        throw new Error('Invalid token format');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMessage = 'Login failed';
      
      if (error.response) {
        // Server responded with error status
        errorMessage = error.response.data?.message || 
                      error.response.data?.error || 
                      `Server error: ${error.response.status}`;
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'Cannot connect to server. Please check your internet connection.';
      } else if (error.message) {
        // Something else happened
        errorMessage = error.message;
      }
      
      dispatch({ 
        type: 'AUTH_ERROR', 
        payload: errorMessage 
      });
      
      // Re-throw error so SignInForm can handle it
      throw new Error(errorMessage);
    }
  };


  const updateAccessToken = (accessToken: string) => {
    try {
      const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]));
      const savedUser = localStorage.getItem('user');
      let user = savedUser ? JSON.parse(savedUser) : null;
      if (user) {
        user = { ...user, current_tenant_id: tokenPayload.tenantId } as User;
      }
      localStorage.setItem('token', accessToken);
      if (user) localStorage.setItem('user', JSON.stringify(user));
      // If backend returns tenant object, save it, else build from tokenPayload
      let tenant: Tenant | null = null;
      if (tokenPayload.tenant) {
        tenant = tokenPayload.tenant;
      } else if (tokenPayload.tenantId) {
        // Try to get from localStorage (e.g. after select-tenant API)
        tenant = getCurrentTenantFromStorage();
        if (!tenant) {
          // Fallback: minimal tenant object
          tenant = { id: tokenPayload.tenantId, slug: '', domain: '', createdAt: '' };
        }
      }
      if (tenant) {
        // Write both keys used elsewhere
        localStorage.setItem('currentTenant', JSON.stringify(tenant));
        localStorage.setItem('current_tenant', JSON.stringify(tenant));
        setCurrentTenantState(tenant);
      }
      if (user) {
        dispatch({ type: 'AUTH_SUCCESS', payload: user as User });
      }
    } catch (e) {
      dispatch({ type: 'AUTH_ERROR', payload: 'Invalid token' });
    }
  };

  const logout = async () => {
    try {
      // Call API logout to invalidate token on server
      await authApi.logout();
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with local logout even if API fails
    }
    
    // Clear all auth-related data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('currentTenant');
    localStorage.removeItem('current_tenant');
    localStorage.removeItem('current_tenant_id');
    localStorage.removeItem('current_tenant_slug');
    
    // Clear tenant state
    setCurrentTenantState(null);
    
    // Dispatch logout action
    dispatch({ type: 'AUTH_LOGOUT' });
  };

  const setCurrentTenant = (tenantId: string) => {
    // Update both tenant localStorage keys if possible
    const stored = getCurrentTenantFromStorage();
    let tenantObj: Tenant | null = null;
    if (stored && stored.id === tenantId) {
      tenantObj = stored;
    } else if (stored) {
      tenantObj = { ...stored, id: tenantId } as Tenant;
    }
    if (tenantObj) {
      localStorage.setItem('current_tenant', JSON.stringify(tenantObj));
      localStorage.setItem('currentTenant', JSON.stringify(tenantObj));
      localStorage.setItem('current_tenant_id', tenantObj.id);
      localStorage.setItem('current_tenant_slug', tenantObj.slug || '');
      setCurrentTenantState(tenantObj);
    } else {
      // If we don't have full tenant object, at least set the id
      localStorage.setItem('current_tenant_id', tenantId);
      setCurrentTenantState(prev => prev && prev.id === tenantId ? prev : { ...prev, id: tenantId } as Tenant);
    }

    dispatch({ type: 'SET_CURRENT_TENANT', payload: tenantId });
  };

  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    setCurrentTenant,
    updateAccessToken,
    currentTenant,
  };

  console.log('AuthProvider providing context value:', contextValue);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
