'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress, Typography } from '@mui/material';

export default function CashflowPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to sales table by default
    router.replace('/cashflow/sales');
  }, [router]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
      <CircularProgress size={48} />
      <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
        Redirecting to sales table...
      </Typography>
    </Box>
  );
}
