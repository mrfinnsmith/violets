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
    
    root.style.setProperty('--bg-color', bgTheme === 'dark' ? '#000000' : '#ffffff');
    
    if (colTheme === 'violet') {
      root.style.setProperty('--theme-color', '#a855f7');
      root.style.setProperty('--theme-filter', 
        'brightness(0) saturate(100%) invert(48%) sepia(79%) saturate(2476%) hue-rotate(286deg) brightness(97%) contrast(96%)'
      );
    } else {
      root.style.setProperty('--theme-color', '#00ff41');
      root.style.setProperty('--theme-filter',
        'brightness(0) saturate(100%) invert(50%) sepia(100%) saturate(2000%) hue-rotate(80deg) brightness(120%)'
      );
    }
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