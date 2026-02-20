import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { Colors, ThemeColors, deriveAccentColors } from '../constants/Colors';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  mode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
  setAccent: (hex: string | null) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('system');
  const [accent, setAccentState] = useState<string | null>(null);

  const isDark = mode === 'system' ? systemScheme === 'dark' : mode === 'dark';

  const colors = useMemo(() => {
    const base = isDark ? Colors.dark : Colors.light;
    if (!accent) return base;
    return { ...base, ...deriveAccentColors(accent, isDark) };
  }, [isDark, accent]);

  const toggle = useCallback(() => {
    setMode(prev => {
      if (prev === 'system') return isDark ? 'light' : 'dark';
      return prev === 'dark' ? 'light' : 'dark';
    });
  }, [isDark]);

  const setAccent = useCallback((hex: string | null) => setAccentState(hex), []);

  const value = useMemo(
    () => ({ mode, isDark, colors, setMode, toggle, setAccent }),
    [mode, isDark, colors, toggle, setAccent]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
