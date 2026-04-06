import React, { createContext, useContext, useMemo, useState, ReactNode } from 'react';
import { useColorScheme as useSystemColorScheme, ColorSchemeName } from 'react-native';

type ThemeValue = {
  colorScheme: NonNullable<ColorSchemeName>;
  setColorScheme: (scheme: 'light' | 'dark') => void;
};

const ThemeContext = createContext<ThemeValue | undefined>(undefined);

type ThemeProviderProps = {
  children: ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemScheme = useSystemColorScheme() ?? 'light';
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>(systemScheme === 'dark' ? 'dark' : 'light');

  const value = useMemo(
    () => ({
      colorScheme,
      setColorScheme,
    }),
    [colorScheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeController() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useThemeController must be used within ThemeProvider');
  }
  return ctx;
}

export { ThemeContext };

