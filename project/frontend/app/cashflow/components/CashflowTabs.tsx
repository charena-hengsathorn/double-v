'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Box, Tabs, Tab } from '@mui/material';

export default function CashflowTabs() {
  const pathname = usePathname();
  
  // Determine current tab based on pathname
  const getCurrentTab = () => {
    if (pathname === '/cashflow/sales') return 1;
    if (pathname === '/cashflow/billings') return 2;
    return 0; // Overview
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
          label="Overview" 
          component={Link} 
          href="/cashflow"
          sx={{ 
            '&.Mui-selected': { 
              fontWeight: 500 
            } 
          }}
        />
        <Tab 
          label="Sales Table" 
          component={Link} 
          href="/cashflow/sales"
          sx={{ 
            '&.Mui-selected': { 
              fontWeight: 500 
            } 
          }}
        />
        <Tab 
          label="Billings Table" 
          component={Link} 
          href="/cashflow/billings"
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


