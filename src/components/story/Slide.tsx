import React, { forwardRef } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { Slide as SlideType } from '@/types/StoryConfig';
import { PanelRenderer } from '../panels/PanelRenderer';
import { getSlideRows } from '@/utils/configLoader';
import { useStoryConfig } from '@/core/stores/StoryStore';
import { getSxClasses, getPanelSx } from './story-styles';

interface SlideProps {
  slide: SlideType;
  slideId: string;
  index: number;
}

// Typography variant (visual size) + semantic element for each heading level. Level 1 (the
// default - most slides) keeps today's look; 2-4 are progressively smaller sub-heading slides.
const HEADING_BY_LEVEL = {
  1: { variant: 'h4', component: 'h1' },
  2: { variant: 'h5', component: 'h2' },
  3: { variant: 'h6', component: 'h3' },
  4: { variant: 'subtitle1', component: 'h4' },
} as const;

export const Slide = forwardRef<HTMLElement | null, SlideProps>(({ slide, slideId, index }, ref) => {
  const theme = useTheme();
  const classes = getSxClasses(theme).slide;
  const heading = HEADING_BY_LEVEL[slide.level ?? 1] ?? HEADING_BY_LEVEL[1];
  const rows = getSlideRows(slide.panel);
  // Slide-level (not per-row) media check, so the slide's own min-height pacing kicks in as long
  // as at least one stacked row has media - not just when the very first row does.
  const hasMedia = rows.some(row => row.some(p => ['image', 'map', 'video', 'slideshow'].includes(p.type)));
  // Story-wide default (if any) plus this slide's own overrides, field by field - lets a story set
  // one look for every title without repeating it, while any slide can still override just the
  // fields it cares about (e.g. `border: false` opts back out of a default border for one slide).
  const titleStyle = { ...useStoryConfig()?.defaultTitleStyle, ...slide.titleStyle };

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
      sx={classes.section(hasMedia, rows.length === 0)}
    >
      <Box sx={classes.inner}>
        <Typography variant={heading.variant} component={heading.component} sx={classes.title(titleStyle, rows.length > 0)}>
          {slide.title}
        </Typography>
        {rows.length > 0 && (
          <Box sx={classes.rows}>
            {rows.map((row, rowIndex) => {
              // Determine layout: horizontal if text + image/map, vertical otherwise - computed per
              // row, since each stacked row lays out independently of its siblings.
              const hasMultiplePanels = row.length > 1;
              const rowHasMedia = row.some(p => ['image', 'map', 'video', 'slideshow'].includes(p.type));
              const hasTextAndImage = hasMultiplePanels && row.some(p => p.type === 'text') && rowHasMedia;
              // Any multi-panel row can lay out side by side on desktop (stacked on mobile), not
              // just the text+media pairing - that's what lets cssClasses (grow/grow-2/no-grow)
              // split a row between any combination of panels, not only a paired text+media one.
              const flexDirection = hasMultiplePanels ? { xs: 'column', md: 'row' } : 'column';

              return (
                <Box key={rowIndex} sx={classes.row(flexDirection, hasTextAndImage, rowHasMedia)}>
                  {row.map((panel, panelIndex) => (
                    // cssClasses goes here (the actual flex item in the row), not inside the panel's own
                    // component - flex-grow/basis classes only mean anything on a direct flex child.
                    <Box
                      key={panelIndex}
                      sx={getPanelSx(panel, hasTextAndImage, hasMultiplePanels, theme)}
                      className={panel.cssClasses}
                    >
                      <PanelRenderer panel={panel} panelInstanceId={`${slideId}-row-${rowIndex}-panel-${panelIndex}`} />
                    </Box>
                  ))}
                </Box>
              );
            })}
          </Box>
        )}

      </Box>
    </Box>
  );
});

Slide.displayName = 'Slide';
