'use client';

import { createTheme } from '@mui/material/styles';

// Minimal Theme - Current elegant, minimal design
export const minimalTheme = createTheme({
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

// Classic Theme - Traditional business theme with more contrast and structure
export const classicTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2', // Classic blue
      light: '#42a5f5',
      dark: '#1565c0',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#9c27b0', // Purple accent
      light: '#ba68c8',
      dark: '#7b1fa2',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#2e7d32', // Green
      light: '#4caf50',
      dark: '#1b5e20',
    },
    warning: {
      main: '#ed6c02', // Orange
      light: '#ff9800',
      dark: '#e65100',
    },
    error: {
      main: '#d32f2f', // Red
      light: '#ef5350',
      dark: '#c62828',
    },
    info: {
      main: '#0288d1', // Blue
      light: '#03a9f4',
      dark: '#01579b',
    },
    background: {
      default: '#f5f5f5', // Light gray
      paper: '#FFFFFF',
    },
    text: {
      primary: '#212121',
      secondary: '#757575',
    },
    grey: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#eeeeee',
      300: '#e0e0e0',
      400: '#bdbdbd',
      500: '#9e9e9e',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
    },
    divider: 'rgba(0, 0, 0, 0.12)',
  },
  typography: {
    fontFamily: [
      'Roboto',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
      lineHeight: 1.2,
      letterSpacing: '-0.01562em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
      lineHeight: 1.3,
      letterSpacing: '-0.00833em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
      lineHeight: 1.4,
      letterSpacing: '0em',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.43,
    },
    button: {
      textTransform: 'uppercase',
      fontWeight: 500,
      letterSpacing: '0.02857em',
    },
  },
  shape: {
    borderRadius: 4,
  },
  spacing: 8,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          padding: '10px 22px',
          fontWeight: 500,
          textTransform: 'uppercase',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)',
          },
        },
        contained: {
          backgroundColor: '#1976d2',
          color: '#FFFFFF',
          boxShadow: '0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)',
          '&:hover': {
            backgroundColor: '#1565c0',
            boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)',
          },
        },
        outlined: {
          borderColor: '#1976d2',
          color: '#1976d2',
          '&:hover': {
            borderColor: '#1565c0',
            backgroundColor: 'rgba(25, 118, 210, 0.04)',
          },
        },
        text: {
          color: '#1976d2',
          '&:hover': {
            backgroundColor: 'rgba(25, 118, 210, 0.04)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          boxShadow: '0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)',
          backgroundColor: '#FFFFFF',
          transition: 'box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
          '&:hover': {
            boxShadow: '0px 3px 3px -2px rgba(0,0,0,0.2), 0px 3px 4px 0px rgba(0,0,0,0.14), 0px 1px 8px 0px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          boxShadow: '0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)',
        },
        elevation1: {
          boxShadow: '0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)',
        },
        elevation2: {
          boxShadow: '0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          margin: '2px 0',
          '&:hover': {
            backgroundColor: 'rgba(25, 118, 210, 0.08)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(25, 118, 210, 0.12)',
            '&:hover': {
              backgroundColor: 'rgba(25, 118, 210, 0.16)',
            },
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 4,
            '& fieldset': {
              borderColor: '#bdbdbd',
            },
            '&:hover fieldset': {
              borderColor: '#212121',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#1976d2',
              borderWidth: '2px',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontWeight: 500,
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-root': {
            borderColor: 'rgba(224, 224, 224, 1)',
          },
        },
      },
    },
  },
});

// Default export for backward compatibility
export const theme = minimalTheme;
