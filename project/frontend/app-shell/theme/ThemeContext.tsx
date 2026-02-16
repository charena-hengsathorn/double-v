'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type ThemeMode = 'minimal' | 'classic';

interface ThemeContextType {
  themeMode: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeContextProvider({ children }: { children: ReactNode }) {
  const [themeMode, setThemeMode] = useState<ThemeMode>('minimal');

  // Load theme preference from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('themeMode') as ThemeMode;
    if (savedTheme === 'minimal' || savedTheme === 'classic') {
      setThemeMode(savedTheme);
    }
  }, []);

  // Save theme preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('themeMode', themeMode);
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === 'minimal' ? 'classic' : 'minimal'));
  };

  return (
    <ThemeContext.Provider value={{ themeMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeContextProvider');
  }
  return context;
}

