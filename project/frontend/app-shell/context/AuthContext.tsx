'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337/api';

interface User {
  id: number;
  username: string;
  email: string;
  role?: {
    name: string;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check for existing session on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('jwt');
      const storedUser = localStorage.getItem('user');
      
      // Restore user from localStorage immediately for faster UI
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (e) {
          // Invalid stored user data
          localStorage.removeItem('user');
        }
      }

      if (!token) {
        setLoading(false);
        return;
      }

      // Verify token and get fresh user data
      try {
        const response = await axios.get(`${STRAPI_URL}/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Update with fresh user data
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
      } catch (error) {
        // Token invalid or expired - try to use stored user as fallback
        // If stored user exists, keep it; otherwise clear everything
        if (!storedUser) {
          localStorage.removeItem('jwt');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
    } catch (error) {
      // Clear everything on error
      localStorage.removeItem('jwt');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // Attempt to authenticate with Strapi
      const response = await axios.post(`${STRAPI_URL}/auth/local`, {
        identifier: email, // Strapi accepts email or username as identifier
        password: password,
      });

      const { jwt, user: userData } = response.data;
      
      // Store both token and user data in localStorage
      localStorage.setItem('jwt', jwt);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error: any) {
      // Check if it's an authentication error
      if (error.response?.status === 400 || error.response?.status === 401) {
        const errorMessage = error.response?.data?.error?.message || 'Invalid email or password';
        throw new Error(errorMessage);
      }
      
      // For demo/development: allow fallback if Strapi is not available
      // Remove this in production
      if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
        console.warn('Strapi not available, using demo mode');
        const mockUser: User = {
          id: 1,
          username: email.split('@')[0],
          email: email,
          role: { name: 'authenticated' },
        };
        localStorage.setItem('jwt', 'demo-token');
        localStorage.setItem('user', JSON.stringify(mockUser));
        setUser(mockUser);
        router.push('/dashboard');
        return;
      }
      
      throw new Error('Login failed. Please try again.');
    }
  };

  const logout = () => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
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

