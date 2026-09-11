import type { Theme } from '@mui/material/styles';
import { Panel } from '@/types/StoryConfig';

// Slide vertical padding, in theme spacing units (top + bottom); kept as one
// constant so the row/media height calcs below can never drift out of sync with it.
const slidePaddingYUnits = 8;

/** The row's own guaranteed min height, reused as the image/video crop cap below */
const getSlideContentHeight = (theme: Theme) => `calc(80vh - ${theme.spacing(slidePaddingYUnits * 2)})`;

/** Shared sx classes for the story-level components (intro slide, slide layout, story viewer) */
export const getSxClasses = (theme: Theme) => ({
  introSlide: {
    root: {
      // vh is computed against the largest possible mobile viewport (address bar
      // hidden), so it can cut off content/jump on load; dvh tracks the real one.
      minHeight: '50vh',
      '@supports (height: 50dvh)': { minHeight: '50dvh' },
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
    // Mostly fills the screen for pacing, but only when there's a media panel
    // to fill it; text/quote-only slides size to their (often short) content instead.
    section: (hasMedia: boolean) => ({
      ...(hasMedia && {
        minHeight: '80vh',
        '@supports (height: 80dvh)': { minHeight: '80dvh' },
      }),
      py: slidePaddingYUnits,
      position: 'relative',
      width: '100%',
    }),
    inner: { position: 'relative', width: '100%', px: { xs: 2, md: 4 } },
    row: (flexDirection: { xs: string; md: string } | string, hasTextAndImage: boolean, hasMedia: boolean) => ({
      display: 'flex',
      flexDirection,
      gap: 4,
      // Both columns just sit centered in normal flow; no sticky/pinning, so
      // text and media scroll together like ordinary page content.
      alignItems: 'center',
      justifyContent: 'center',
      ...(hasMedia && {
        minHeight: getSlideContentHeight(theme),
        '@supports (height: 80dvh)': {
          minHeight: `calc(80dvh - ${theme.spacing(slidePaddingYUnits * 2)})`,
        },
      }),
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
    root: {
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      '@supports (height: 100dvh)': { minHeight: '100dvh' },
    },
    centeredMessage: { display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center' },
    contentRow: { display: 'flex', flex: 1 },
    main: { flex: 1 },
  },
});

/** Per-panel sizing within a Slide, depends on panel type and slide layout */
// Width caps, named so the reasoning behind each number lives in one place
// instead of being re-derived from scattered percentages.
const TEXT_WIDTH_PAIRED_WITH_MEDIA = '33.333%'; // squeeze so the media column can claim the rest
const TEXT_WIDTH_STANDALONE = '50%'; // no media to make room for, so it can breathe more
const QUOTE_WIDTH_STANDALONE = '66.666%'; // pull-quotes read better wide, but not full-bleed

export const getPanelSx = (panel: Panel, hasTextAndImage: boolean, hasMultiplePanels: boolean, theme: Theme) => {
  const isTextPanel = panel.type === 'text';
  const isMediaPanel = ['image', 'map', 'video', 'slideshow'].includes(panel.type);

  const sx: any = {
    flex: hasTextAndImage ? '1 1 auto' : '0 1 auto',
    width: '100%',
  };

  if (hasTextAndImage) {
    if (isTextPanel) {
      // Fixed and doesn't grow, so the media column can claim the rest of the width
      sx.flex = { xs: '1 1 auto', md: `0 0 ${TEXT_WIDTH_PAIRED_WITH_MEDIA}` };
      sx.maxWidth = { xs: '100%', md: TEXT_WIDTH_PAIRED_WITH_MEDIA };
    } else if (isMediaPanel) {
      // Grow to fill whatever width is left after the text column, rather than
      // a fixed 2/3 cap that left it looking cramped.
      sx.flex = { xs: '1 1 auto', md: '1 1 0%' };
      sx.maxWidth = { xs: '100%', md: 'none' };
      sx.display = { md: 'flex' };
      sx.alignItems = { md: 'center' };
      sx.justifyContent = { md: 'center' };

      // Sticky so the media stays visible next to a longer scrolling text
      // column; if the media itself ends up taller than the text (a large
      // image/map/video), it has nowhere to stick and just scrolls with the
      // row instead, taking the shorter text along with it.
      sx.position = { md: 'sticky' };
      sx.top = { md: 0 };
      sx.alignSelf = { md: 'flex-start' };
    }
  } else if (!hasMultiplePanels) {
    if (isTextPanel) {
      // Single text panel: wider than the paired case since there's no media column to share with
      sx.maxWidth = { xs: '100%', md: TEXT_WIDTH_STANDALONE };
    } else if (panel.type === 'quote') {
      // Pull-quotes shouldn't stretch edge-to-edge; cap and center so short
      // quotes don't sit in a mostly-empty full-width card.
      sx.maxWidth = { xs: '100%', md: QUOTE_WIDTH_STANDALONE };
    }
  }

  return sx;
};
