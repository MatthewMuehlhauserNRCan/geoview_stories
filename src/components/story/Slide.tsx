import React, { forwardRef } from 'react';
import { Box } from '@mui/material';
import { Slide as SlideType } from '@/types/StoryConfig';
import { PanelRenderer } from '../panels/PanelRenderer';

interface SlideProps {
  slide: SlideType;
  slideId: string;
  index: number;
}

export const Slide = forwardRef<HTMLElement | null, SlideProps>(({ slide, slideId, index }, ref) => {
  // Determine layout: horizontal if text + image/map, vertical otherwise
  const hasMultiplePanels = slide.panel.length > 1;
  const hasTextAndImage = hasMultiplePanels && 
    slide.panel.some(p => p.type === 'text') && 
    slide.panel.some(p => ['image', 'map', 'video'].includes(p.type));
  
  const flexDirection = hasTextAndImage ? { xs: 'column', md: 'row' } : 'column';

  return (
    <Box
      ref={ref}
      component="section"
      id={slideId}
      data-slide-index={index}
      sx={{
        minHeight: '100vh',
        py: 8,
        position: 'relative',
        width: '100%',
      }}
    >
      <Box sx={{ position: 'relative', width: '100%', px: { xs: 2, md: 4 } }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection, 
          gap: 4,
          alignItems: hasTextAndImage ? 'stretch' : 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 128px)',
        }}>
          {slide.panel.map((panel, panelIndex) => {
            // Calculate flex basis for panels
            const isTextPanel = panel.type === 'text';
            const isMediaPanel = ['image', 'map', 'video'].includes(panel.type);
            
            // Determine sizing
            let panelSx: any = {
              flex: hasTextAndImage ? '1 1 auto' : '0 1 auto',
              width: '100%',
            };

            if (hasTextAndImage) {
              // Text takes 1/3, media takes 2/3
              panelSx.maxWidth = isTextPanel ? { xs: '100%', md: '33.333%' } : { xs: '100%', md: '66.667%' };
              
              // Make media sticky when paired with text
              if (isMediaPanel) {
                panelSx.position = { md: 'sticky' };
                panelSx.top = { md: '80px' };
                panelSx.alignSelf = { md: 'flex-start' };
                panelSx.maxHeight = { md: 'calc(100vh - 96px)' };
                panelSx.overflow = { md: 'hidden' };
              }
            } else if (isTextPanel && !hasMultiplePanels) {
              // Single text panel: 1/3 width, centered
              panelSx.maxWidth = { xs: '100%', md: '33.333%' };
            }

            return (
              <Box 
                key={panelIndex}
                sx={panelSx}
              >
                <PanelRenderer panel={panel} />
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
});

Slide.displayName = 'Slide';
