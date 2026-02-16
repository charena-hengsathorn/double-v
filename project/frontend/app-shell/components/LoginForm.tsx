'use client';

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme/ThemeContext';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Palette as PaletteIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { themeMode, toggleTheme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
        position: 'relative',
      }}
    >
      {/* Theme Toggle Button */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
        }}
      >
        <Tooltip title={`Switch to ${themeMode === 'minimal' ? 'Classic' : 'Minimal'} theme`}>
          <IconButton
            onClick={toggleTheme}
            sx={{
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            <PaletteIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card
          sx={{
            maxWidth: 400,
            width: '100%',
            boxShadow: 'none',
            border: '1px solid rgba(44, 44, 44, 0.06)',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 300,
                  color: 'text.primary',
                  letterSpacing: '0.05em',
                  mb: 1,
                }}
              >
                Double V
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ letterSpacing: '0.02em' }}>
                Executive Dashboard
              </Typography>
            </Box>

            <form onSubmit={handleSubmit}>
              {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  {error}
                </Alert>
              )}

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  id="email-address"
                  name="email"
                  type="email"
                  label="Email"
                  autoComplete="email"
                  required
                  fullWidth
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  variant="outlined"
                  disabled={loading}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />

                <TextField
                  id="password"
                  name="password"
                  type="password"
                  label="Password"
                  autoComplete="current-password"
                  required
                  fullWidth
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  variant="outlined"
                  disabled={loading}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 400,
                    letterSpacing: '0.01em',
                  }}
                >
                  {loading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={20} color="inherit" />
                      <span>Signing in...</span>
                    </Box>
                  ) : (
                    'Sign in'
                  )}
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
}
