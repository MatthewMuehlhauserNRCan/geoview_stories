import type { Theme } from '@mui/material/styles';
import { Panel } from '@/types/StoryConfig';

/** Shared sx classes for the story-level components (intro slide, slide layout, story viewer) */
export const getSxClasses = (theme: Theme) => ({
  introSlide: {
    root: {
      minHeight: '50vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: 'primary.main',
    },
    backgroundImage: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      objectPosition: 'center',
      zIndex: 0,
    },
    container: { position: 'relative', zIndex: 2, textAlign: 'center' },
    logoWrapper: { mb: 4 },
    logo: { maxHeight: 120, maxWidth: '100%' },
    title: { color: 'white', fontWeight: 700, mb: 2 },
    subtitle: { color: 'white', mb: 4 },
    enterButton: { px: 4, py: 1.5, fontSize: '1.1rem' },
  },

  slide: {
    section: {
      minHeight: '100vh',
      py: 8,
      position: 'relative',
      width: '100%',
    },
    inner: { position: 'relative', width: '100%', px: { xs: 2, md: 4 } },
    row: (flexDirection: { xs: string; md: string } | string, hasTextAndImage: boolean) => ({
      display: 'flex',
      flexDirection,
      gap: 4,
      alignItems: hasTextAndImage ? 'stretch' : 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 128px)',
    }),
  },

  storyViewer: {
    backgroundLayer: (image: string, isActive: boolean) => ({
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage: image ? `url(${image})` : 'none',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundColor: 'background.default',
      pointerEvents: 'none',
      zIndex: isActive ? -1 : -2,
    }),
    root: { display: 'flex', flexDirection: 'column', minHeight: '100vh' },
    centeredMessage: { display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center' },
    contentRow: { display: 'flex', flex: 1 },
    main: { flex: 1 },
  },
});

/** Per-panel sizing/sticky behavior within a Slide, depends on panel type and slide layout */
export const getPanelSx = (panel: Panel, hasTextAndImage: boolean, hasMultiplePanels: boolean) => {
  const isTextPanel = panel.type === 'text';
  const isMediaPanel = ['image', 'map', 'video'].includes(panel.type);
  // Image/video have unpredictable intrinsic height and need cropping;
  // map manages its own fixed height, so capping it here would clip its shadow.
  const needsHeightCap = ['image', 'video'].includes(panel.type);

  const sx: any = {
    flex: hasTextAndImage ? '1 1 auto' : '0 1 auto',
    width: '100%',
  };

  if (hasTextAndImage) {
    // Text takes 1/3, media takes 2/3
    sx.maxWidth = isTextPanel ? { xs: '100%', md: '33.333%' } : { xs: '100%', md: '66.667%' };

    if (isMediaPanel) {
      // Pin the media in place while the text scrolls past it; text stays
      // in normal flow so it can grow to any length without its own scrollbar.
      sx.position = { md: 'sticky' };
      sx.top = { md: '80px' };
      sx.alignSelf = { md: 'flex-start' };
      if (needsHeightCap) {
        sx.maxHeight = { md: 'calc(100vh - 96px)' };
        sx.overflow = { md: 'hidden' };
      }
    }
  } else if (isTextPanel && !hasMultiplePanels) {
    // Single text panel: 1/3 width, centered
    sx.maxWidth = { xs: '100%', md: '33.333%' };
  }

  return sx;
};
