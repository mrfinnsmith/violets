'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type BackgroundTheme = 'dark' | 'light';
type ColorTheme = 'violet' | 'apple';

interface ThemeContextType {
  backgroundTheme: BackgroundTheme;
  colorTheme: ColorTheme;
  toggleBackgroundTheme: () => void;
  toggleColorTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [backgroundTheme, setBackgroundTheme] = useState<BackgroundTheme>('dark');
  const [colorTheme, setColorTheme] = useState<ColorTheme>('violet');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedBackgroundTheme = localStorage.getItem('backgroundTheme') as BackgroundTheme;
    const savedColorTheme = localStorage.getItem('colorTheme') as ColorTheme;
    if (savedBackgroundTheme) {
      setBackgroundTheme(savedBackgroundTheme);
    }
    if (savedColorTheme) {
      setColorTheme(savedColorTheme);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('backgroundTheme', backgroundTheme);
      localStorage.setItem('colorTheme', colorTheme);
      applyTheme(backgroundTheme, colorTheme);
    }
  }, [backgroundTheme, colorTheme, mounted]);

  const applyTheme = (bgTheme: BackgroundTheme, colTheme: ColorTheme) => {
    const root = document.documentElement;
    
    // Set background
    if (bgTheme === 'dark') {
      root.style.setProperty('--bg-color', '#000000');
    } else {
      root.style.setProperty('--bg-color', '#ffffff');
    }
    
    // Set colors based on color theme
    const textColor = colTheme === 'violet' ? '#a855f7' : '#00ff41';
    root.style.setProperty('--text-color', textColor);
    root.style.setProperty('--theme-color-violet', textColor);
    root.style.setProperty('--theme-color-apple-green', textColor);
  };

  const toggleBackgroundTheme = () => {
    setBackgroundTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const toggleColorTheme = () => {
    setColorTheme(prev => prev === 'violet' ? 'apple' : 'violet');
  };

  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ backgroundTheme, colorTheme, toggleBackgroundTheme, toggleColorTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}