'use client';

import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2C2C2C', // Deep charcoal - elegant and minimal
      light: '#4A4A4A',
      dark: '#1A1A1A',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#D4AF8C', // Warm beige - luxury accent
      light: '#E8D4C0',
      dark: '#B8956F',
      contrastText: '#2C2C2C',
    },
    success: {
      main: '#7A8B7A', // Muted sage green
      light: '#9FAFA0',
      dark: '#5F6F5F',
    },
    warning: {
      main: '#C9A961', // Warm gold
      light: '#DBC18A',
      dark: '#A68A4A',
    },
    error: {
      main: '#B8867A', // Muted terracotta
      light: '#D4A99E',
      dark: '#9A6B5F',
    },
    info: {
      main: '#7A8B9A', // Soft blue-gray
      light: '#9FAFB8',
      dark: '#5F6F7A',
    },
    background: {
      default: '#FAF9F7', // Warm off-white
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2C2C2C',
      secondary: '#6B6B6B', // Soft gray
    },
    grey: {
      50: '#FAF9F7',
      100: '#F5F4F2',
      200: '#E8E6E3',
      300: '#D4D2CF',
      400: '#A8A6A3',
      500: '#6B6B6B',
      600: '#4A4A4A',
      700: '#3A3A3A',
      800: '#2C2C2C',
      900: '#1A1A1A',
    },
    divider: 'rgba(44, 44, 44, 0.08)', // Very subtle divider
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 300, // Lighter weight for elegance
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
      color: '#2C2C2C',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 300,
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
      color: '#2C2C2C',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 400,
      lineHeight: 1.4,
      letterSpacing: '-0.01em',
      color: '#2C2C2C',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 400,
      lineHeight: 1.4,
      color: '#2C2C2C',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 400,
      lineHeight: 1.5,
      color: '#2C2C2C',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.5,
      color: '#2C2C2C',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.7, // More breathing room
      color: '#2C2C2C',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
      color: '#6B6B6B',
    },
    button: {
      textTransform: 'none',
      fontWeight: 400,
      letterSpacing: '0.01em',
    },
  },
  shape: {
    borderRadius: 8, // Slightly smaller, more refined
  },
  spacing: 8, // Base spacing unit
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          padding: '12px 24px',
          fontWeight: 400,
          textTransform: 'none',
          boxShadow: 'none',
          letterSpacing: '0.01em',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          backgroundColor: '#2C2C2C',
          color: '#FFFFFF',
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: '#1A1A1A',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          },
        },
        outlined: {
          borderColor: '#E8E6E3',
          color: '#2C2C2C',
          '&:hover': {
            borderColor: '#D4D2CF',
            backgroundColor: 'rgba(44, 44, 44, 0.04)',
          },
        },
        text: {
          color: '#2C2C2C',
          '&:hover': {
            backgroundColor: 'rgba(44, 44, 44, 0.04)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
          border: '1px solid rgba(44, 44, 44, 0.06)',
          backgroundColor: '#FFFFFF',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
            borderColor: 'rgba(44, 44, 44, 0.1)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
          border: '1px solid rgba(44, 44, 44, 0.06)',
        },
        elevation1: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
        },
        elevation2: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderBottom: '1px solid rgba(44, 44, 44, 0.06)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: '1px solid rgba(44, 44, 44, 0.06)',
          boxShadow: 'none',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          margin: '2px 0',
          '&:hover': {
            backgroundColor: 'rgba(44, 44, 44, 0.04)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(44, 44, 44, 0.08)',
            '&:hover': {
              backgroundColor: 'rgba(44, 44, 44, 0.12)',
            },
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 6,
            '& fieldset': {
              borderColor: '#E8E6E3',
            },
            '&:hover fieldset': {
              borderColor: '#D4D2CF',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#2C2C2C',
              borderWidth: '1px',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          fontWeight: 400,
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-root': {
            borderColor: 'rgba(44, 44, 44, 0.06)',
          },
        },
      },
    },
  },
});
