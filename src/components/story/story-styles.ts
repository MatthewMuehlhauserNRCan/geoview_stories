import type { Theme } from '@mui/material/styles';
import { HeadingStyle, Panel } from '@/types/StoryConfig';

// Slide vertical padding, in theme spacing units (top + bottom); kept as one
// constant so the row/media height calcs below can never drift out of sync with it.
const slidePaddingYUnits = 8;

/** The row's own guaranteed min height, reused as the image/video crop cap below */
const getSlideContentHeight = (theme: Theme) => `calc(80vh - ${theme.spacing(slidePaddingYUnits * 2)})`;

// `color`/`backgroundColor`/`borderColor` (and its per-side longhands) are resolved against
// `theme.palette` automatically by MUI's sx system - but `textDecorationColor` isn't one of the
// props that system covers, so a dot-path token like 'primary.main' has to be resolved by hand
// or it's passed through as literal (invalid) CSS and silently ignored.
const resolveThemeColor = (theme: Theme, value: string): string => {
  const path = value.split('.');
  let result: unknown = theme.palette;
  for (const key of path) {
    result = (result as Record<string, unknown> | undefined)?.[key];
    if (result === undefined) return value;
  }
  return typeof result === 'string' ? result : value;
};

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
    // Guarantees text contrast regardless of the background image's own
    // colors (WCAG) - a flat scrim alone can't cover every possible photo,
    // so it's paired with a text/icon shadow below for a local contrast halo.
    // Opacity is configurable per-story since how dark it needs to be depends on the image.
    scrim: (opacity: number = 0.4) => ({
      position: 'absolute',
      inset: 0,
      backgroundColor: `rgba(0, 0, 0, ${opacity})`,
      zIndex: 1,
    }),
    container: { position: 'relative', zIndex: 2, textAlign: 'center' },
    logoWrapper: { mb: 4 },
    logo: { maxHeight: 120, maxWidth: '100%' },
    title: { color: 'white', fontWeight: 700, mb: 2, textShadow: '0 1px 3px rgba(0, 0, 0, 0.85)' },
    subtitle: { color: 'white', mb: 4, textShadow: '0 1px 3px rgba(0, 0, 0, 0.85)' },
    // Minimal icon-only scroll cue (not a labeled CTA) since it's just
    // indicating more content is right below, not navigating anywhere new.
    scrollCue: {
      position: 'absolute',
      bottom: { xs: 16, md: 32 },
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 2,
      color: 'white',
      filter: 'drop-shadow(0 1px 3px rgba(0, 0, 0, 0.85))',
      '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.15)' },
    },
    scrollCueIcon: {
      animation: 'geoview-story-scroll-cue-bounce 3s infinite',
      '@keyframes geoview-story-scroll-cue-bounce': {
        '0%, 100%': { transform: 'translateY(0)' },
        '50%': { transform: 'translateY(6px)' },
      },
    },
  },

  slide: {
    // Mostly fills the screen for pacing, but only when there's a media panel to fill it; a
    // title-only slide (no panels at all - e.g. a pure section-header slide) gets a much smaller
    // padding, since the usual full slide rhythm would otherwise leave a large empty-looking gap
    // around content that isn't there.
    section: (hasMedia: boolean, isEmpty: boolean) => ({
      ...(hasMedia && {
        minHeight: '80vh',
        '@supports (height: 80dvh)': { minHeight: '80dvh' },
      }),
      py: isEmpty ? 3 : slidePaddingYUnits,
      position: 'relative',
      width: '100%',
    }),
    inner: { position: 'relative', width: '100%', px: { xs: 2, md: 4 } },
    // Vertical stack of a slide's rows - `gap` separates multiple stacked rows under one title;
    // a single-row slide (the common case) just renders one child, so the gap never applies.
    rows: { display: 'flex', flexDirection: 'column', gap: 6 },
    // One heading per slide, sized by the slide's `level` (Slide.tsx picks the variant/component);
    // `style` layers on any per-slide title overrides (align/background/border/font). No bottom
    // margin when there are no panels below it - nothing to space the title away from.
    title: (style?: HeadingStyle, hasRows: boolean = true) => {
      const border = style?.border;
      const borderWidth = typeof border === 'object' && border.width !== undefined
        ? typeof border.width === 'number' ? `${border.width}px` : border.width
        : '1px';
      const borderStyleValue = (typeof border === 'object' && border.style) || 'solid';
      // Longhand per-side props (not a `border` shorthand string) so MUI's sx system can still
      // resolve a theme token like 'divider' for color, and so a partial `sides` list (e.g. just
      // `['bottom']` for a simple rule under the title) only sets the sides actually wanted.
      const borderColor = (typeof border === 'object' && border.color) || 'divider';
      const allSides: Array<'top' | 'right' | 'bottom' | 'left'> = ['top', 'right', 'bottom', 'left'];
      const borderSides = (typeof border === 'object' && border.sides) || allSides;
      const isFullBorder = borderSides.length === allSides.length;
      const borderSx: Record<string, string> = {};
      borderSides.forEach(side => {
        const cap = side.charAt(0).toUpperCase() + side.slice(1);
        borderSx[`border${cap}Width`] = borderWidth;
        borderSx[`border${cap}Style`] = borderStyleValue;
        borderSx[`border${cap}Color`] = borderColor;
      });

      const underline = style?.underline;
      const underlineColor = resolveThemeColor(theme, (typeof underline === 'object' && underline.color) || 'currentColor');
      const underlineThickness = typeof underline === 'object' && underline.thickness !== undefined
        ? typeof underline.thickness === 'number' ? `${underline.thickness}px` : underline.thickness
        : '2px';
      const underlineOffset = typeof underline === 'object' && underline.offset !== undefined
        ? typeof underline.offset === 'number' ? `${underline.offset}px` : underline.offset
        : '4px';

      return {
        fontWeight: style?.fontWeight ?? 600,
        mb: hasRows ? 3 : 0,
        ...(style?.align && { textAlign: style.align }),
        ...(style?.color && { color: style.color }),
        ...(style?.fontSize && { fontSize: style.fontSize }),
        ...(style?.backgroundColor && { backgroundColor: style.backgroundColor }),
        ...(style?.backgroundImage && {
          backgroundImage: `url(${style.backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }),
        ...(underline && {
          textDecorationLine: 'underline',
          textDecorationColor: underlineColor,
          textDecorationThickness: underlineThickness,
          textUnderlineOffset: underlineOffset,
        }),
        ...(border && borderSx),
        // A full 4-side border gets the usual boxed-heading padding; a partial one (e.g.
        // bottom-only) just gets a little breathing room on the side(s) it's actually drawn on,
        // so it reads as a simple rule rather than an oddly-padded box.
        ...(border && isFullBorder && { p: 2, borderRadius: 1 }),
        ...(border && !isFullBorder && Object.fromEntries(
          borderSides.map(side => [{ top: 'pt', right: 'pr', bottom: 'pb', left: 'pl' }[side], 1])
        )),
        ...(!border && (style?.backgroundColor || style?.backgroundImage) && { p: 2, borderRadius: 1 }),
      };
    },
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
    // Used instead of contentRow when the TOC is a horizontal top bar rather than a side Drawer.
    stackedColumn: { display: 'flex', flexDirection: 'column', flex: 1 },
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
    // cssClasses (applied to this same Box in Slide.tsx) uses !important, so it reliably
    // overrides these defaults regardless - no need to special-case it away here.
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
