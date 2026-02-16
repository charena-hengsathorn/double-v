'use client';

import { ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeContextProvider, useTheme } from './ThemeContext';
import { minimalTheme, classicTheme } from './theme';

function MUIThemeProviderWrapper({ children }: { children: React.ReactNode }) {
  const { themeMode } = useTheme();
  const theme = themeMode === 'minimal' ? minimalTheme : classicTheme;

  return (
    <MUIThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MUIThemeProvider>
  );
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeContextProvider>
      <MUIThemeProviderWrapper>{children}</MUIThemeProviderWrapper>
    </ThemeContextProvider>
  );
}





