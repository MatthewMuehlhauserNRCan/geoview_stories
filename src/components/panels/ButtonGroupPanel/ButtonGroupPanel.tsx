import React, { useState } from 'react';
import { Box, Button } from '@mui/material';
import type { ButtonGroupPanel as ButtonGroupPanelType } from '@/types/StoryConfig';
import { runInteraction } from '@/core/interactions/runInteraction';
import { getSxClasses } from './ButtonGroupPanel-style';

interface ButtonGroupPanelProps {
  panel: ButtonGroupPanelType;
}

export const ButtonGroupPanel: React.FC<ButtonGroupPanelProps> = ({ panel }) => {
  const classes = getSxClasses();
  // Tracks just the one button currently awaiting its interaction, so only that button disables.
  const [runningIndex, setRunningIndex] = useState<number | null>(null);

  const handleClick = async (index: number, interactionId: string): Promise<void> => {
    setRunningIndex(index);
    try {
      await runInteraction(interactionId);
    } finally {
      setRunningIndex(null);
    }
  };

  return (
    <Box sx={classes.root(panel.direction ?? 'row')}>
      {panel.buttons.map((button, index) => (
        <Button
          key={index}
          variant={button.variant ?? 'contained'}
          disabled={runningIndex === index}
          onClick={() => {
            handleClick(index, button.interactionId).catch((err) => console.error('[ButtonGroupPanel] Interaction failed:', err));
          }}
        >
          {button.label}
        </Button>
      ))}
    </Box>
  );
};
