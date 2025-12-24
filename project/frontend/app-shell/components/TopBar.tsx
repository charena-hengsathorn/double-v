'use client';

import { useAuth } from '../context/AuthContext';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  AccountCircle,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { motion } from 'framer-motion';
import BranchSwitcher from './BranchSwitcher';

export default function TopBar() {
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const getInitials = (email: string) => {
    return email
      .split('@')[0]
      .split('.')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const userEmail = user?.email || user?.username || 'user';

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <BranchSwitcher />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
              {userEmail}
            </Typography>
          </Box>
          <IconButton
            onClick={handleMenuOpen}
            size="small"
            sx={{
              '&:hover': {
                transform: 'scale(1.1)',
              },
              transition: 'transform 0.2s',
            }}
          >
            <Avatar
              sx={{
                bgcolor: 'grey.200',
                color: 'text.primary',
                width: 36,
                height: 36,
                fontSize: '0.75rem',
                fontWeight: 400,
              }}
            >
              {getInitials(userEmail)}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            PaperProps={{
              sx: {
                mt: 1.5,
                minWidth: 200,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                border: '1px solid rgba(44, 44, 44, 0.06)',
              },
            }}
          >
            <MenuItem disabled>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5 }}>
                <AccountCircle sx={{ color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {userEmail}
                </Typography>
              </Box>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <LogoutIcon fontSize="small" sx={{ color: 'error.main' }} />
                <Typography variant="body2" color="error.main">
                  Sign Out
                </Typography>
              </Box>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
