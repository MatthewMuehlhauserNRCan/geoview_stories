import React from 'react';
import { Box } from '@mui/material';
import type { GroupPanel as GroupPanelConfig } from '@/types/StoryConfig';
import { getSlideRows, rowHasFlowingPairing } from '@/utils/configLoader';
import { getPanelSx } from '@/components/story/story-styles';
import { PanelRenderer } from '../PanelRenderer';
import { getSxClasses } from './GroupPanel-style';

interface GroupPanelProps {
  panel: GroupPanelConfig;
  panelInstanceId?: string;
}

// Renders a group panel's own rows the same way Slide.tsx renders a slide's rows (side by side
// on desktop, stacked on mobile) - reuses the same row-layout normalization (getSlideRows) and
// per-panel sizing (getPanelSx) so a group behaves like a nested mini-slide-body.
export const GroupPanel: React.FC<GroupPanelProps> = ({ panel, panelInstanceId }) => {
  const classes = getSxClasses();
  const rows = getSlideRows(panel.panel);

  return (
    <Box sx={classes.rows}>
      {rows.map((row, rowIndex) => {
        const hasMultiplePanels = row.length > 1;
        const hasPairing = rowHasFlowingPairing(row);
        const flexDirection = hasMultiplePanels ? { xs: 'column', md: 'row' } : 'column';

        return (
          <Box key={rowIndex} sx={classes.row(flexDirection)}>
            {row.map((childPanel, panelIndex) => (
              <Box
                key={panelIndex}
                sx={getPanelSx(childPanel, hasPairing, hasMultiplePanels, true)}
                className={childPanel.cssClasses}
              >
                <PanelRenderer
                  panel={childPanel}
                  panelInstanceId={panelInstanceId ? `${panelInstanceId}-row-${rowIndex}-panel-${panelIndex}` : undefined}
                />
              </Box>
            ))}
          </Box>
        );
      })}
    </Box>
  );
};
