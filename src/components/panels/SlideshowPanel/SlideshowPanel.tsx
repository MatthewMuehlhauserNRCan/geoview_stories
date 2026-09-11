import React, { useCallback, useState } from 'react';
import { Box, IconButton, Modal, Typography } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import CloseIcon from '@mui/icons-material/Close';
import { SlideshowPanel as SlideshowPanelType } from '@/types/StoryConfig';
import { getSxClasses } from './SlideshowPanel-style';

interface SlideshowPanelProps {
  panel: SlideshowPanelType;
}

export const SlideshowPanel: React.FC<SlideshowPanelProps> = ({ panel }) => {
  const classes = getSxClasses();
  const [activeIndex, setActiveIndex] = useState(0);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const { items, loop = false, objectFit = 'cover' } = panel;
  const count = items.length;

  const goTo = useCallback(
    (index: number) => {
      if (count === 0) return;
      setActiveIndex(loop ? ((index % count) + count) % count : Math.min(Math.max(index, 0), count - 1));
    },
    [count, loop]
  );

  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);
  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);

  const openFullscreen = () => setFullscreenOpen(true);
  const closeFullscreen = () => setFullscreenOpen(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goPrev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      goNext();
    }
  };

  if (count === 0) return null;

  const activeItem = items[activeIndex];
  const canGoPrev = loop || activeIndex > 0;
  const canGoNext = loop || activeIndex < count - 1;

  return (
    <Box sx={classes.wrapper}>
      {panel.title && (
        <Typography variant="h5" component="h3" sx={classes.title}>
          {panel.title}
        </Typography>
      )}
      <Box
        sx={classes.carousel}
        role="region"
        aria-roledescription="carousel"
        aria-label={panel.title || 'Image gallery'}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        <Box component="img" src={activeItem.src} alt={activeItem.altText || ''} sx={classes.image(objectFit)} />

        <IconButton onClick={openFullscreen} sx={classes.expandButton} aria-label="View image full screen">
          <FullscreenIcon />
        </IconButton>

        {activeItem.text && (
          <Box sx={classes.textOverlay(activeItem.textPosition || 'left')}>
            <Typography variant="body1" sx={classes.overlayText}>
              {activeItem.text}
            </Typography>
          </Box>
        )}

        {count > 1 && (
          <>
            <IconButton onClick={goPrev} disabled={!canGoPrev} sx={classes.navButton('left')} aria-label="Previous image">
              <ChevronLeftIcon fontSize="large" />
            </IconButton>
            <IconButton onClick={goNext} disabled={!canGoNext} sx={classes.navButton('right')} aria-label="Next image">
              <ChevronRightIcon fontSize="large" />
            </IconButton>

            <Box sx={classes.dots}>
              {items.map((_, index) => (
                <Box
                  key={index}
                  component="button"
                  type="button"
                  onClick={() => goTo(index)}
                  aria-label={`Go to image ${index + 1} of ${count}`}
                  aria-current={index === activeIndex ? 'true' : undefined}
                  sx={classes.dot(index === activeIndex)}
                />
              ))}
            </Box>
          </>
        )}

        {/* Visually hidden live region so screen readers announce slide changes */}
        <Box component="span" sx={classes.visuallyHidden} aria-live="polite">
          {`Image ${activeIndex + 1} of ${count}`}
        </Box>
      </Box>

      {/* Full screen view: shows the whole image uncropped, with the same nav controls */}
      <Modal open={fullscreenOpen} onClose={closeFullscreen} sx={classes.lightboxModal}>
        <Box sx={classes.lightboxBackdrop} onClick={closeFullscreen} onKeyDown={handleKeyDown} tabIndex={-1}>
          <IconButton onClick={closeFullscreen} sx={classes.lightboxCloseButton} aria-label="Close full screen image">
            <CloseIcon />
          </IconButton>

          <Box component="img" src={activeItem.src} alt={activeItem.altText || ''} sx={classes.lightboxImage} onClick={(e) => e.stopPropagation()} />

          {count > 1 && (
            <>
              <IconButton
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                disabled={!canGoPrev}
                sx={classes.navButton('left')}
                aria-label="Previous image"
              >
                <ChevronLeftIcon fontSize="large" />
              </IconButton>
              <IconButton
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                disabled={!canGoNext}
                sx={classes.navButton('right')}
                aria-label="Next image"
              >
                <ChevronRightIcon fontSize="large" />
              </IconButton>
            </>
          )}
        </Box>
      </Modal>
    </Box>
  );
};
