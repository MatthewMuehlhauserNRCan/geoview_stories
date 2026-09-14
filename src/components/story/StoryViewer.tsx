import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, CssBaseline, Fade, ThemeProvider, useTheme } from '@mui/material';
import { TocItem } from '@/types/StoryConfig';
import { TableOfContents } from '../layout/TableOfContents';
import { IntroSlide } from './IntroSlide';
import { Slide } from './Slide';
import { useScrollSpy } from '@/hooks/useScrollSpy';
import { useScrollToSlide } from '@/hooks/useScrollToSlide';
import { useStoryInit } from '@/hooks/useGeoViewInit';
import { useStoryStore } from '@/hooks/useStoryStore';
import { generateSlideId } from '@/utils/configLoader';
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
  const classes = getSxClasses(useTheme()).storyViewer;

  // Initialize story viewer using controller - loads config and initializes maps
  const containerRef = useStoryInit(configPath);
  
  // Subscribe to store for config and loading state
  const { config, loading, error } = useStoryStore();

  const slideRefs = useRef<React.RefObject<HTMLElement | null>[]>([]);
  const scrollToSlide = useScrollToSlide(64);
  const [tocCollapsed, setTocCollapsed] = React.useState(false);

  // Generate slide IDs and refs
  const slideIds = config?.slides.map((slide, index) => generateSlideId(index, slide.title, slide.id)) || [];
  
  useEffect(() => {
    if (config) {
      slideRefs.current = config.slides.map(() => React.createRef<HTMLElement | null>());
    }
  }, [config]);

  const activeIndex = useScrollSpy(slideRefs.current, slideIds, !loading);

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
  const [activeLayer, setActiveLayer] = useState<1 | 2>(1);

  // Get active slide's background image
  const activeBackgroundImage = config?.slides[activeIndex]?.backgroundImage || '';

  // Handle background image crossfade between two layers
  useEffect(() => {
    const currentBg = activeLayer === 1 ? bgLayer1 : bgLayer2;
    
    if (activeBackgroundImage !== currentBg) {
      // Update the inactive layer and switch to it
      if (activeLayer === 1) {
        setBgLayer2(activeBackgroundImage);
        setActiveLayer(2);
      } else {
        setBgLayer1(activeBackgroundImage);
        setActiveLayer(1);
      }
    }
  }, [activeBackgroundImage, activeLayer, bgLayer1, bgLayer2]);

  const handleEnterStory = () => {
    if (slideIds.length > 0) {
      scrollToSlide(slideIds[0]);
    }
  };

  const handleTocItemClick = (slideId: string) => {
    scrollToSlide(slideId);
  };

  // Build TOC items (only meaningful once config has loaded). An explicit `tableOfContents`
  // (custom labels, sublist grouping, theme-page links) overrides the auto-derived list.
  const tocItems: TocItem[] = config
    ? config.tableOfContents ??
      config.slides
        .map((slide, index) => ({
          title: slide.title,
          slideIndex: index,
        }))
        .filter((item, index) => config.slides[index].includeInToc !== false)
    : [];

  return (
    <>
      {/* Full-page background with MUI Fade crossfade - Layer 1 */}
      <Fade in={activeLayer === 1} timeout={800}>
        <Box sx={classes.backgroundLayer(bgLayer1, activeLayer === 1)} />
      </Fade>

      {/* Full-page background with MUI Fade crossfade - Layer 2 */}
      <Fade in={activeLayer === 2} timeout={800}>
        <Box sx={classes.backgroundLayer(bgLayer2, activeLayer === 2)} />
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
          <Box sx={classes.contentRow}>
            <TableOfContents
              items={tocItems}
              slideIds={slideIds}
              heading={config.tocHeading}
              activeIndex={activeIndex}
              onItemClick={handleTocItemClick}
              orientation={config.tocOrientation}
              collapsed={tocCollapsed}
              onToggle={() => setTocCollapsed(!tocCollapsed)}
            />

            <Box component="main" sx={classes.main}>
              {config.introSlide && (
                <IntroSlide intro={config.introSlide} onEnter={handleEnterStory} />
              )}

              {config.slides.map((slide, index) => (
                <Slide
                  key={index}
                  ref={slideRefs.current[index]}
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
