'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Box, Button, ButtonGroup } from '@mui/material';
import { useMemo } from 'react';

const BRANCHES = [
  { id: 'construction', name: 'Construction', path: '/construction' },
  { id: 'loose-furniture', name: 'Loose Furniture', path: '/loose-furniture' },
  { id: 'interior-design', name: 'Interior Design', path: '/interior-design' },
] as const;

export type BranchId = typeof BRANCHES[number]['id'];

export function getBranchFromPath(pathname: string): BranchId | null {
  if (pathname.startsWith('/construction')) return 'construction';
  if (pathname.startsWith('/loose-furniture')) return 'loose-furniture';
  if (pathname.startsWith('/interior-design')) return 'interior-design';
  return null;
}

export function getBranchName(branchId: BranchId): string {
  return BRANCHES.find(b => b.id === branchId)?.name || branchId;
}

export default function BranchSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  
  const currentBranch = useMemo(() => getBranchFromPath(pathname), [pathname]);
  
  // Only show on branch pages
  if (!currentBranch) return null;
  
  const handleBranchChange = (branchPath: string) => {
    // Replace the current branch path with the new one
    const currentSection = pathname.replace(/^\/(construction|loose-furniture|interior-design)/, '');
    router.push(`${branchPath}${currentSection}`);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
      <ButtonGroup 
        variant="outlined" 
        size="small"
        sx={{
          '& .MuiButton-root': {
            textTransform: 'none',
            fontSize: '0.875rem',
            px: 2,
            borderColor: 'divider',
            color: 'text.secondary',
            '&:hover': {
              borderColor: 'primary.main',
              color: 'primary.main',
            },
          },
          '& .MuiButtonGroup-grouped:not(:last-of-type)': {
            borderRight: 'none',
          },
        }}
      >
        {BRANCHES.map((branch) => (
          <Button
            key={branch.id}
            onClick={() => handleBranchChange(branch.path)}
            variant={currentBranch === branch.id ? 'contained' : 'outlined'}
            sx={{
              ...(currentBranch === branch.id && {
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
              }),
            }}
          >
            {branch.name}
          </Button>
        ))}
      </ButtonGroup>
    </Box>
  );
}

