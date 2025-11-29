'use client';

import { ToggleButton, ToggleButtonGroup, Box } from '@mui/material';
import { motion } from 'framer-motion';

interface ScenarioToggleProps {
  selectedScenario: string;
  onScenarioChange: (scenario: string) => void;
  scenarios?: { id: string; label: string }[];
}

export default function ScenarioToggle({ 
  selectedScenario, 
  onScenarioChange,
  scenarios = [
    { id: 'base', label: 'Base' },
    { id: 'best', label: 'Best Case' },
    { id: 'worst', label: 'Worst Case' },
  ]
}: ScenarioToggleProps) {
  const handleChange = (
    event: React.MouseEvent<HTMLElement>,
    newScenario: string | null,
  ) => {
    if (newScenario !== null) {
      onScenarioChange(newScenario);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Box sx={{ display: 'flex', gap: 1, bgcolor: 'grey.100', p: 0.5, borderRadius: 2 }}>
        <ToggleButtonGroup
          value={selectedScenario}
          exclusive
          onChange={handleChange}
          aria-label="scenario selection"
          sx={{
            '& .MuiToggleButton-root': {
              border: 'none',
              borderRadius: 1.5,
              px: 3,
              py: 1,
              textTransform: 'none',
              fontWeight: 500,
              color: 'text.secondary',
              '&.Mui-selected': {
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
              },
              '&:hover': {
                bgcolor: 'action.hover',
              },
            },
          }}
        >
          {scenarios.map((scenario) => (
            <ToggleButton key={scenario.id} value={scenario.id}>
              {scenario.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>
    </motion.div>
  );
}
