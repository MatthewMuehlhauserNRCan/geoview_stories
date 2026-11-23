import type { Theme } from '@mui/material/styles';

export const HOTSPOT_CLASS = 'svg-hotspot';

// Injected into the panel's shadow root alongside the SVG itself - sx/emotion styles can't reach
// inside a shadow root, and the SVG lives there so its own <style> blocks and ids stay scoped to
// it (see SvgHotspotPanel). Theme colours come in through CSS custom properties, which do inherit
// across the shadow boundary. The 900px breakpoint matches MUI's default `md`.
export const SHADOW_STYLES = `
  :host { display: block; line-height: 0; }
  svg { display: block; width: 100%; height: auto; }
  @media (min-width: 900px) { svg { max-height: 70vh; } }
  .${HOTSPOT_CLASS} {
    cursor: pointer;
    outline: none;
    transition: opacity 150ms ease, filter 150ms ease;
  }
  .${HOTSPOT_CLASS}:hover { opacity: 0.85; filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.35)); }
  /* A drop-shadow rather than an outline, which browsers draw around the element's bounding box
     (a square around a circle) or not at all for SVG content. */
  .${HOTSPOT_CLASS}:focus-visible {
    filter: drop-shadow(0 0 2px var(--svg-hotspot-focus)) drop-shadow(0 0 4px var(--svg-hotspot-focus));
  }
  @media (prefers-reduced-motion: reduce) { .${HOTSPOT_CLASS} { transition: none; } }
`;

export const getSxClasses = () => ({
  // Same full-bleed-on-mobile/centered treatment as ImagePanel, so the two read as siblings.
  wrapper: { mx: { xs: -2, md: 0 }, width: '100%', textAlign: 'center' },
  figure: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    m: 0,
    overflow: 'hidden',
    borderRadius: { xs: 0, md: 2 },
  },
  svgHost: (theme: Theme) => ({
    '--svg-hotspot-focus': theme.palette.primary.main,
  }),
  caption: {
    px: 2,
    py: 1,
    backgroundColor: 'action.hover',
    borderTop: '1px solid',
    borderColor: 'divider',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
