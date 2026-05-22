import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  isDark: boolean;
  toggle: () => void;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem('theme');
    return (stored as ThemeMode) || 'light';
  });

  const isDark = mode === 'dark';

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', mode);
  }, [mode, isDark]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const stored = localStorage.getItem('theme');
      if (!stored) {
        setModeState(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggle = useCallback(() => {
    setModeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
  }, []);

  return (
    <ThemeContext.Provider value={{ mode, isDark, toggle, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;