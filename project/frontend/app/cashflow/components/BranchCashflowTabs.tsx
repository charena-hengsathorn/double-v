'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Box, Tabs, Tab } from '@mui/material';
import { getBranchFromPath } from '../../../app-shell/components/BranchSwitcher';

interface BranchCashflowTabsProps {
  branchPath: string;
  branchName: string;
}

export default function BranchCashflowTabs({ branchPath, branchName }: BranchCashflowTabsProps) {
  const pathname = usePathname();
  
  // Determine current tab based on pathname
  const getCurrentTab = () => {
    if (pathname === `${branchPath}/sales`) return 1;
    if (pathname === `${branchPath}/billings`) return 2;
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
          label={`${branchName} - Overview`}
          component={Link} 
          href={`${branchPath}/overview`}
          sx={{ 
            '&.Mui-selected': { 
              fontWeight: 500 
            } 
          }}
        />
        <Tab 
          label={`${branchName} - Sales`}
          component={Link} 
          href={`${branchPath}/sales`}
          sx={{ 
            '&.Mui-selected': { 
              fontWeight: 500 
            } 
          }}
        />
        <Tab 
          label={`${branchName} - Billings`}
          component={Link} 
          href={`${branchPath}/billings`}
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



