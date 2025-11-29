'use client';

import Link from 'next/link';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { motion } from 'framer-motion';
import {
  Assessment as AssessmentIcon,
  AccountBalance as AccountBalanceIcon,
  Summarize as SummarizeIcon,
  AccountBalanceWallet as CashflowIcon,
} from '@mui/icons-material';

const dashboardCards = [
  {
    title: 'Pipeline Integrity',
    description: 'Monitor conversion health and risk exposure',
    href: '/dashboard/pipeline-integrity',
    icon: AssessmentIcon,
    color: 'primary',
  },
  {
    title: 'Financials',
    description: 'Evaluate cash flow and revenue outlook',
    href: '/dashboard/financials',
    icon: AccountBalanceIcon,
    color: 'success',
  },
  {
    title: 'Executive Summary',
    description: 'Rapid insight via concise summary',
    href: '/dashboard/executive-summary',
    icon: SummarizeIcon,
    color: 'secondary',
  },
  {
    title: 'Cashflow',
    description: 'Monitor cash inflows, outflows, and liquidity',
    href: '/dashboard/cashflow',
    icon: CashflowIcon,
    color: 'info',
  },
];

export default function DashboardHome() {
  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Typography variant="h4" sx={{ fontWeight: 300, mb: 1, letterSpacing: '-0.02em' }}>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Welcome to Double V Executive Dashboard Suite
        </Typography>
      </motion.div>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 3 }}>
        {dashboardCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
            >
              <Link href={card.href} style={{ textDecoration: 'none' }}>
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 6,
                    },
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 2,
                        bgcolor: `${card.color}.light`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2,
                      }}
                    >
                      <Icon sx={{ fontSize: 32, color: `${card.color}.main` }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 400, mb: 1 }}>
                      {card.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {card.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </Box>
    </Box>
  );
}
