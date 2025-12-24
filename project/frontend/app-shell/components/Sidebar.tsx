'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Divider,
  Button,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assessment as AssessmentIcon,
  AccountBalance as AccountBalanceIcon,
  Summarize as SummarizeIcon,
  AccountBalanceWallet as CashflowIcon,
  AttachMoney as SalesIcon,
  Receipt as BillingsIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const drawerWidth = 280;

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: DashboardIcon },
  { name: 'Construction', href: '/construction/overview', icon: CashflowIcon },
  { name: 'Loose Furniture', href: '/loose-furniture/overview', icon: CashflowIcon },
  { name: 'Interior Design', href: '/interior-design/overview', icon: CashflowIcon },
];

const dashboardSubPages = [
  { name: 'Pipeline Integrity', href: '/dashboard/pipeline-integrity', icon: AssessmentIcon },
  { name: 'Financials', href: '/dashboard/financials', icon: AccountBalanceIcon },
  { name: 'Executive Summary', href: '/dashboard/executive-summary', icon: SummarizeIcon },
  { name: 'Sales', href: '/dashboard/sales', icon: SalesIcon },
  { name: 'Cashflow', href: '/dashboard/cashflow', icon: CashflowIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        sx={{
          p: 3,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Link href="/dashboard" style={{ textDecoration: 'none' }}>
          <Typography
            variant="h5"
            component="div"
            sx={{
              fontWeight: 300,
              color: 'text.primary',
              letterSpacing: '0.05em',
              cursor: 'pointer',
              transition: 'opacity 0.2s',
              '&:hover': {
                opacity: 0.7,
              },
            }}
          >
            Double V
          </Typography>
        </Link>
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        <List sx={{ gap: 0.5 }}>
          {navigation.map((item, index) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;
            
            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <ListItem disablePadding sx={{ mb: 0.5 }}>
                  <Link href={item.href} style={{ textDecoration: 'none', width: '100%' }}>
                    <ListItemButton
                      sx={{
                        borderRadius: 1.5,
                        bgcolor: isActive ? 'rgba(44, 44, 44, 0.08)' : 'transparent',
                        color: isActive ? 'text.primary' : 'text.secondary',
                        fontWeight: isActive ? 500 : 400,
                        '&:hover': {
                          bgcolor: isActive ? 'rgba(44, 44, 44, 0.12)' : 'rgba(44, 44, 44, 0.04)',
                        },
                        transition: 'all 0.2s ease-in-out',
                        py: 1.5,
                        px: 2,
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          color: isActive ? 'text.primary' : 'text.secondary',
                          minWidth: 40,
                        }}
                      >
                        <Icon />
                      </ListItemIcon>
                      <ListItemText
                        primary={item.name}
                        primaryTypographyProps={{
                          fontWeight: isActive ? 500 : 400,
                          fontSize: '0.95rem',
                        }}
                      />
                    </ListItemButton>
                  </Link>
                </ListItem>
              </motion.div>
            );
          })}
          
          {/* Dashboard Sub-pages */}
          {pathname.startsWith('/dashboard') && (
            <>
              <Divider sx={{ my: 1, mx: 2 }} />
              <Typography
                variant="caption"
                sx={{
                  px: 2,
                  py: 1,
                  color: 'text.secondary',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  fontSize: '0.7rem',
                  fontWeight: 500,
                }}
              >
                Dashboard Sections
              </Typography>
              {dashboardSubPages.map((item, index) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                
                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: (navigation.length + index) * 0.05 }}
                  >
                    <ListItem disablePadding sx={{ mb: 0.5 }}>
                      <Link href={item.href} style={{ textDecoration: 'none', width: '100%' }}>
                        <ListItemButton
                          sx={{
                            borderRadius: 1.5,
                            bgcolor: isActive ? 'rgba(44, 44, 44, 0.08)' : 'transparent',
                            color: isActive ? 'text.primary' : 'text.secondary',
                            fontWeight: isActive ? 500 : 400,
                            pl: 4,
                            '&:hover': {
                              bgcolor: isActive ? 'rgba(44, 44, 44, 0.12)' : 'rgba(44, 44, 44, 0.04)',
                            },
                            transition: 'all 0.2s ease-in-out',
                            py: 1.5,
                            px: 2,
                          }}
                        >
                          <ListItemIcon
                            sx={{
                              color: isActive ? 'text.primary' : 'text.secondary',
                              minWidth: 40,
                            }}
                          >
                            <Icon />
                          </ListItemIcon>
                          <ListItemText
                            primary={item.name}
                            primaryTypographyProps={{
                              fontWeight: isActive ? 500 : 400,
                              fontSize: '0.9rem',
                            }}
                          />
                        </ListItemButton>
                      </Link>
                    </ListItem>
                  </motion.div>
                );
              })}
            </>
          )}

          {/* Branch Sub-pages */}
          {(pathname.startsWith('/construction') || pathname.startsWith('/loose-furniture') || pathname.startsWith('/interior-design')) && (() => {
            const branchPrefix = pathname.startsWith('/construction') ? '/construction' : 
                               pathname.startsWith('/loose-furniture') ? '/loose-furniture' : 
                               '/interior-design';
            const branchName = pathname.startsWith('/construction') ? 'Construction' : 
                              pathname.startsWith('/loose-furniture') ? 'Loose Furniture' : 
                              'Interior Design';
            
            return (
              <>
                <Divider sx={{ my: 1, mx: 2 }} />
                <Typography
                  variant="caption"
                  sx={{
                    px: 2,
                    py: 1,
                    color: 'text.secondary',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    fontSize: '0.7rem',
                    fontWeight: 500,
                  }}
                >
                  {branchName} Sections
                </Typography>
                {[
                  { name: 'Overview', href: `${branchPrefix}/overview`, icon: CashflowIcon },
                  { name: 'Sales', href: `${branchPrefix}/sales`, icon: SalesIcon },
                  { name: 'Billings', href: `${branchPrefix}/billings`, icon: BillingsIcon },
                ].map((item, index) => {
                  const isActive = pathname === item.href || (item.href === `${branchPrefix}/overview` && pathname === branchPrefix);
                  const Icon = item.icon;
                  
                  return (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: (navigation.length + index) * 0.05 }}
                    >
                      <ListItem disablePadding sx={{ mb: 0.5 }}>
                        <Link href={item.href} style={{ textDecoration: 'none', width: '100%' }}>
                          <ListItemButton
                            sx={{
                              borderRadius: 1.5,
                              bgcolor: isActive ? 'rgba(44, 44, 44, 0.08)' : 'transparent',
                              color: isActive ? 'text.primary' : 'text.secondary',
                              fontWeight: isActive ? 500 : 400,
                              pl: 4,
                              '&:hover': {
                                bgcolor: isActive ? 'rgba(44, 44, 44, 0.12)' : 'rgba(44, 44, 44, 0.04)',
                              },
                              transition: 'all 0.2s ease-in-out',
                              py: 1.5,
                              px: 2,
                            }}
                          >
                            <ListItemIcon
                              sx={{
                                color: isActive ? 'text.primary' : 'text.secondary',
                                minWidth: 40,
                              }}
                            >
                              <Icon />
                            </ListItemIcon>
                            <ListItemText
                              primary={item.name}
                              primaryTypographyProps={{
                                fontWeight: isActive ? 500 : 400,
                                fontSize: '0.9rem',
                              }}
                            />
                          </ListItemButton>
                        </Link>
                      </ListItem>
                    </motion.div>
                  );
                })}
              </>
            );
          })()}
        </List>
      </Box>

      {/* User Info at Bottom */}
      <Box
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            sx={{
              bgcolor: 'grey.200',
              color: 'text.primary',
              width: 40,
              height: 40,
              mr: 2,
              fontSize: '0.875rem',
              fontWeight: 400,
            }}
          >
            {getInitials(userEmail)}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                color: 'text.primary',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {userEmail}
            </Typography>
          </Box>
        </Box>
        <Button
          fullWidth
          variant="text"
          startIcon={<LogoutIcon />}
          onClick={logout}
          sx={{
            textTransform: 'none',
            borderRadius: 1.5,
            color: 'text.secondary',
            fontWeight: 400,
            '&:hover': {
              color: 'text.primary',
              bgcolor: 'rgba(44, 44, 44, 0.04)',
            },
          }}
        >
          Sign Out
        </Button>
      </Box>
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={false}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
          },
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}
