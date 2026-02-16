'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Box, Tabs, Tab } from '@mui/material';

export default function ExecutiveTabs() {
  const pathname = usePathname();
  
  // Determine current tab based on pathname
  const getCurrentTab = () => {
    if (pathname === '/dashboard/executive-dashboard') return 1;
    return 0; // Executive Insights (executive-summary)
  };
  
  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
      <Tabs 
        value={getCurrentTab()}
        sx={{
          '& .MuiTab-root': {
            textTransform: 'none',
            fontSize: '0.95rem',
            fontWeight: 400,
            minHeight: 48,
          },
        }}
      >
        <Tab 
          label="Executive Insights"
          component={Link} 
          href="/dashboard/executive-summary"
          sx={{ 
            '&.Mui-selected': { 
              fontWeight: 500 
            } 
          }}
        />
        <Tab 
          label="Executive Dashboard"
          component={Link} 
          href="/dashboard/executive-dashboard"
          sx={{ 
            '&.Mui-selected': { 
              fontWeight: 500 
            } 
          }}
        />
      </Tabs>
    </Box>
  );
}

