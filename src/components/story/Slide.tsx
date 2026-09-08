import React, { forwardRef } from 'react';
import { Box, useTheme } from '@mui/material';
import { Slide as SlideType } from '@/types/StoryConfig';
import { PanelRenderer } from '../panels/PanelRenderer';
import { getSxClasses, getPanelSx } from './story-styles';

interface SlideProps {
  slide: SlideType;
  slideId: string;
  index: number;
}

export const Slide = forwardRef<HTMLElement | null, SlideProps>(({ slide, slideId, index }, ref) => {
  const classes = getSxClasses(useTheme()).slide;

  // Determine layout: horizontal if text + image/map, vertical otherwise
  const hasMultiplePanels = slide.panel.length > 1;
  const hasTextAndImage = hasMultiplePanels && 
    slide.panel.some(p => p.type === 'text') && 
    slide.panel.some(p => ['image', 'map', 'video'].includes(p.type));
  
  const flexDirection = hasTextAndImage ? { xs: 'column', md: 'row' } : 'column';

  return (
    <Box ref={ref} component="section" id={slideId} data-slide-index={index} sx={classes.section}>
      <Box sx={classes.inner}>
        <Box sx={classes.row(flexDirection, hasTextAndImage)}>
          {slide.panel.map((panel, panelIndex) => (
            <Box key={panelIndex} sx={getPanelSx(panel, hasTextAndImage, hasMultiplePanels)}>
              <PanelRenderer panel={panel} panelInstanceId={`${slideId}-panel-${panelIndex}`} />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
});

Slide.displayName = 'Slide';
