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
      if (!token) {
        setLoading(false);
        return;
      }

      // Verify token and get user
      const response = await axios.get(`${STRAPI_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(response.data);
    } catch (error) {
      // Token invalid or expired
      localStorage.removeItem('jwt');
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
      localStorage.setItem('jwt', jwt);
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
        setUser(mockUser);
        router.push('/dashboard');
        return;
      }
      
      throw new Error('Login failed. Please try again.');
    }
  };

  const logout = () => {
    localStorage.removeItem('jwt');
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

