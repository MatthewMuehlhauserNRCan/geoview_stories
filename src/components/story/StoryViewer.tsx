import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, CssBaseline, Fade, ThemeProvider, useMediaQuery, useTheme } from '@mui/material';
import { TocItem } from '@/types/StoryConfig';
import { TableOfContents } from '../layout/TableOfContents';
import { HorizontalToc } from '../layout/HorizontalToc';
import { IntroSlide } from './IntroSlide';
import { Slide } from './Slide';
import { useScrollSpy } from '@/hooks/useScrollSpy';
import { useScrollToSlide } from '@/hooks/useScrollToSlide';
import { useStoryInit } from '@/hooks/useGeoViewStoryInit';
import { useStoryStore } from '@/core/stores/StoryStore';
import { generateSlideId } from '@/utils/configLoader';
import { resolveTableOfContents } from '@/utils/tocBuilder';
import { buildStoryTheme } from '@/theme/buildTheme';
import { getSxClasses } from './story-styles';

interface StoryViewerProps {
  configPath: string;
}

/** Builds the story's theme from its config (falls back to the default while loading) and provides it to the actual viewer. */
export const StoryViewer: React.FC<StoryViewerProps> = ({ configPath }) => {
  const { config } = useStoryStore();
  const theme = useMemo(() => buildStoryTheme(config?.theme), [config?.theme]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <StoryViewerContent configPath={configPath} />
    </ThemeProvider>
  );
};

const StoryViewerContent: React.FC<StoryViewerProps> = ({ configPath }) => {
  const theme = useTheme();
  const classes = getSxClasses(theme).storyViewer;
  // A horizontal TOC only makes sense as a slim top bar with a one-level dropdown - below this
  // width it falls back to the vertical TableOfContents, which already has its own mobile drawer.
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  // Initialize story viewer using controller - loads config and initializes maps
  const containerRef = useStoryInit(configPath);
  
  // Subscribe to store for config and loading state
  const { config, loading, error } = useStoryStore();

  const scrollToSlide = useScrollToSlide(64);
  const [tocCollapsed, setTocCollapsed] = React.useState(false);

  const isHorizontalToc = config?.tocOrientation === 'horizontal' && isDesktop;

  // Generate slide IDs and refs
  const slideIds = useMemo(() => {
    return config?.slides.map((slide, index) => generateSlideId(index, slide.title, slide.id)) || [];
  }, [config?.slides]);

  // Built in the same render pass as the JSX that assigns these refs to each Slide (not in a
  // useEffect) - otherwise the refs a Slide actually mounts with are always one render stale,
  // since an effect-based reassignment only lands after that render's commit already happened.
  const slideRefs = useMemo(() => slideIds.map(() => React.createRef<HTMLElement | null>()), [slideIds]);

  const activeIndex = useScrollSpy(slideRefs, slideIds, !loading);

  // The browser's native "scroll to #hash on load" races the async config
  // fetch/render - slides don't exist in the DOM yet when it fires, so it
  // silently no-ops. Do it ourselves once slides have actually mounted.
  const initialHashHandledRef = useRef(false);
  useEffect(() => {
    if (loading || initialHashHandledRef.current || slideIds.length === 0) return;
    initialHashHandledRef.current = true;
    const hash = window.location.hash.slice(1);
    if (hash && slideIds.includes(hash)) {
      scrollToSlide(hash);
    }
  }, [loading, slideIds, scrollToSlide]);

  // Background image state management for true crossfade
  const [bgLayer1, setBgLayer1] = useState<string>('');
  const [bgLayer2, setBgLayer2] = useState<string>('');
  const [scrimLayer1, setScrimLayer1] = useState<number>(0);
  const [scrimLayer2, setScrimLayer2] = useState<number>(0);
  const [activeLayer, setActiveLayer] = useState<1 | 2>(1);

  // Get active slide's background image and scrim darkening. The scrim only ever applies in dark
  // mode - light mode's own UI is already bright, so a bright photo doesn't fight it the way it
  // fights a dark theme - so `backgroundScrimOpacity` (or its 0.5 default) is ignored entirely in
  // light mode rather than being a fixed value that applies regardless of theme.
  const activeSlide = config?.slides[activeIndex];
  const activeBackgroundImage = activeSlide?.backgroundImage || '';
  const activeScrimOpacity = theme.palette.mode === 'dark' ? activeSlide?.backgroundScrimOpacity ?? 0.5 : 0;

  // Handle background image crossfade between two layers
  useEffect(() => {
    const currentBg = activeLayer === 1 ? bgLayer1 : bgLayer2;
    
    if (activeBackgroundImage !== currentBg) {
      // Update the inactive layer and switch to it
      if (activeLayer === 1) {
        setBgLayer2(activeBackgroundImage);
        setScrimLayer2(activeScrimOpacity);
        setActiveLayer(2);
      } else {
        setBgLayer1(activeBackgroundImage);
        setScrimLayer1(activeScrimOpacity);
        setActiveLayer(1);
      }
    }
  }, [activeBackgroundImage, activeScrimOpacity, activeLayer, bgLayer1, bgLayer2]);

  const handleEnterStory = () => {
    if (slideIds.length > 0) {
      scrollToSlide(slideIds[0]);
    }
  };

  const handleTocItemClick = (slideId: string) => {
    scrollToSlide(slideId);
  };

  // Build TOC items (only meaningful once config has loaded). Derived straight from each slide's
  // own title/level (a document-outline-style auto TOC), unless a manual `tableOfContents`
  // overrides it - which can itself splice that auto tree back in via an `{ autoToc: true }` entry.
  const tocItems: TocItem[] = useMemo(() => config ? resolveTableOfContents(config) : [], [config]);

  return (
    <>
      {/* Full-page background with MUI Fade crossfade - Layer 1 */}
      <Fade in={activeLayer === 1} timeout={800}>
        <Box sx={classes.backgroundLayer(bgLayer1, scrimLayer1, activeLayer === 1)} />
      </Fade>

      {/* Full-page background with MUI Fade crossfade - Layer 2 */}
      <Fade in={activeLayer === 2} timeout={800}>
        <Box sx={classes.backgroundLayer(bgLayer2, scrimLayer2, activeLayer === 2)} />
      </Fade>

      {/* containerRef stays mounted across loading/error/ready states so useStoryInit can always find it */}
      <Box ref={containerRef} sx={classes.root}>
        {loading && (
          <Box sx={classes.centeredMessage}>
            Loading story...
          </Box>
        )}

        {!loading && (error || !config) && (
          <Box sx={classes.centeredMessage}>
            {error || 'Story not found'}
          </Box>
        )}

        {!loading && !error && config && (
          <Box sx={isHorizontalToc ? classes.stackedColumn : classes.contentRow}>
            {isHorizontalToc ? (
              <HorizontalToc items={tocItems} slideIds={slideIds} activeIndex={activeIndex} onItemClick={handleTocItemClick} />
            ) : (
              <TableOfContents
                items={tocItems}
                slideIds={slideIds}
                heading={config.tocHeading}
                activeIndex={activeIndex}
                onItemClick={handleTocItemClick}
                collapsed={tocCollapsed}
                onToggle={() => setTocCollapsed(!tocCollapsed)}
              />
            )}

            <Box component="main" sx={classes.main}>
              {config.introSlide && (
                <IntroSlide intro={config.introSlide} onEnter={handleEnterStory} />
              )}

              {config.slides.map((slide, index) => (
                <Slide
                  key={index}
                  ref={slideRefs[index]}
                  slide={slide}
                  slideId={slideIds[index]}
                  index={index}
                />
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </>
  );
};
