import React, { useEffect, useRef, useState } from 'react';
import { Box, Fade } from '@mui/material';
import { TocItem } from '@/types/StoryConfig';
import { TableOfContents } from '../layout/TableOfContents';
import { IntroSlide } from './IntroSlide';
import { Slide } from './Slide';
import { useScrollSpy } from '@/hooks/useScrollSpy';
import { useScrollToSlide } from '@/hooks/useScrollToSlide';
import { useStoryInit } from '@/hooks/useGeoViewInit';
import { useStoryStore } from '@/hooks/useStoryStore';
import { generateSlideId } from '@/utils/configLoader';

interface StoryViewerProps {
  configPath: string;
}

export const StoryViewer: React.FC<StoryViewerProps> = ({ configPath }) => {
  // Initialize story viewer using controller - loads config and initializes maps
  const containerRef = useStoryInit(configPath);
  
  // Subscribe to store for config and loading state
  const { config, loading, error } = useStoryStore();

  const slideRefs = useRef<React.RefObject<HTMLElement | null>[]>([]);
  const scrollToSlide = useScrollToSlide(64);
  const [tocCollapsed, setTocCollapsed] = React.useState(false);

  // Generate slide IDs and refs
  const slideIds = config?.slides.map((slide, index) => generateSlideId(index, slide.title)) || [];
  
  useEffect(() => {
    if (config) {
      slideRefs.current = config.slides.map(() => React.createRef<HTMLElement | null>());
    }
  }, [config]);

  const activeIndex = useScrollSpy(slideRefs.current, slideIds, !loading);

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

  // Build TOC items (only meaningful once config has loaded)
  const tocItems: TocItem[] = config
    ? config.slides
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
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: bgLayer1 ? `url(${bgLayer1})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundColor: 'background.default',
            pointerEvents: 'none',
            zIndex: activeLayer === 1 ? -1 : -2,
          }}
        />
      </Fade>

      {/* Full-page background with MUI Fade crossfade - Layer 2 */}
      <Fade in={activeLayer === 2} timeout={800}>
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: bgLayer2 ? `url(${bgLayer2})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundColor: 'background.default',
            pointerEvents: 'none',
            zIndex: activeLayer === 2 ? -1 : -2,
          }}
        />
      </Fade>

      {/* containerRef stays mounted across loading/error/ready states so useStoryInit can always find it */}
      <Box ref={containerRef} sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {loading && (
          <Box sx={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            Loading story...
          </Box>
        )}

        {!loading && (error || !config) && (
          <Box sx={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            {error || 'Story not found'}
          </Box>
        )}

        {!loading && !error && config && (
          <Box sx={{ display: 'flex', flex: 1 }}>
            <TableOfContents
              items={tocItems}
              activeIndex={activeIndex}
              onItemClick={handleTocItemClick}
              orientation={config.tocOrientation}
              collapsed={tocCollapsed}
              onToggle={() => setTocCollapsed(!tocCollapsed)}
            />

            <Box
              component="main"
              sx={{
                flex: 1,
              }}
            >
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
