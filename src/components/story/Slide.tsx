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
  const theme = useTheme();
  const classes = getSxClasses(theme).slide;

  // Determine layout: horizontal if text + image/map, vertical otherwise
  const hasMultiplePanels = slide.panel.length > 1;
  const hasMedia = slide.panel.some(p => ['image', 'map', 'video', 'slideshow'].includes(p.type));
  const hasTextAndImage = hasMultiplePanels && 
    slide.panel.some(p => p.type === 'text') && 
    hasMedia;
  const flexDirection = hasTextAndImage ? { xs: 'column', md: 'row' } : 'column';

  return (
    <Box
      ref={ref}
      component="section"
      id={slideId}
      data-slide-index={index}
      // Not in the normal Tab order; focused programmatically when TOC
      // navigation jumps here, so keyboard/screen-reader users land on the slide.
      tabIndex={-1}
      aria-label={slide.title}
      sx={classes.section(hasMedia)}
    >
      <Box sx={classes.inner}>
        <Box sx={classes.row(flexDirection, hasTextAndImage, hasMedia)}>
          {slide.panel.map((panel, panelIndex) => (
            <Box key={panelIndex} sx={getPanelSx(panel, hasTextAndImage, hasMultiplePanels, theme)}>
              <PanelRenderer panel={panel} panelInstanceId={`${slideId}-panel-${panelIndex}`} />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
});

Slide.displayName = 'Slide';
