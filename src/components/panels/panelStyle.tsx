import React, { createContext, useCallback, useContext, useMemo } from 'react';
import { createTheme, Theme, ThemeProvider } from '@mui/material/styles';
import type { SystemStyleObject } from '@mui/system';
import type { PanelStyle } from '@/types/StoryConfig';
import { getHeadingBorderSx, toCssLength } from '@/components/story/story-styles';

type FrameSx = SystemStyleObject<Theme>;

const PanelFrameContext = createContext<FrameSx>({});

const FONT_VARIANTS = [
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'subtitle1', 'subtitle2', 'body1', 'body2',
  'button', 'caption', 'overline',
] as const;

const hasThemeOverrides = (style: PanelStyle): boolean =>
  !!(style.backgroundColor || style.color || style.accentColor || style.fontFamily || style.overlayColor || style.overlayHoverColor);

/** The story theme with this panel's color/font overrides layered on top - typography variants
 * each carry their own already-resolved fontFamily, so a new base fontFamily has to be pushed into
 * every variant too or Typography components would keep the story's font. */
export const buildPanelTheme = (outer: Theme, style: PanelStyle): Theme =>
  createTheme({
    ...outer,
    palette: {
      ...outer.palette,
      ...(style.accentColor && { primary: { main: style.accentColor } }),
      ...(style.backgroundColor && { background: { ...outer.palette.background, paper: style.backgroundColor } }),
      ...(style.color && { text: { ...outer.palette.text, primary: style.color } }),
      overlay: {
        ...outer.palette.overlay,
        ...(style.overlayColor && { main: style.overlayColor }),
        ...(style.overlayHoverColor && { hover: style.overlayHoverColor }),
      },
    },
    typography: style.fontFamily
      ? {
          ...outer.typography,
          fontFamily: style.fontFamily,
          ...Object.fromEntries(FONT_VARIANTS.map((v) => [v, { ...outer.typography[v], fontFamily: style.fontFamily }])),
        }
      : outer.typography,
  });

/** Same value at every breakpoint - a panel's own responsive default (e.g. `borderRadius: { xs: 0,
 * md: 2 }`) emits media-query rules that a plain scalar override wouldn't beat. */
const atAllBreakpoints = (value: string) => ({ xs: value, sm: value, md: value, lg: value, xl: value });

/** Overrides for a panel's own outer frame (card/paper/figure), layered last onto its sx. */
export const getPanelFrameSx = (style: PanelStyle | undefined): FrameSx => {
  if (!style) return {};
  const { border, shadow, borderRadius, padding, backgroundColor, color, fontFamily } = style;
  return {
    // Clear whatever border the panel already has first, so a partial `sides` border or `false`
    // isn't left layered on top of e.g. a map's default all-around border.
    ...(border !== undefined && { border: 'none' }),
    ...(border && getHeadingBorderSx(border).sx),
    ...(shadow === false && { boxShadow: 'none' }),
    ...(shadow === true && { boxShadow: 2 }),
    ...(borderRadius !== undefined && { borderRadius: atAllBreakpoints(toCssLength(borderRadius, '0')) }),
    ...(padding !== undefined && { p: atAllBreakpoints(toCssLength(padding, '0')) }),
    ...(backgroundColor && { backgroundColor }),
    // Also set directly (not just via the theme) for plain HTML content like rendered markdown,
    // which inherits CSS from the frame rather than reading theme typography.
    ...(color && { color }),
    ...(fontFamily && { fontFamily }),
  };
};

/** sx to append to a panel's outer frame element - `{}` when the panel has no style override. */
export const usePanelFrameSx = (): FrameSx => useContext(PanelFrameContext);

/**
 * Scopes a panel's `style` override to it: colors/font via a nested theme (so they also reach a
 * group's child panels and anything inside drawn from theme tokens), frame fields via context.
 * The context is reset per panel, so a group's border/padding don't also land on its children.
 */
export const PanelStyleScope: React.FC<{ style?: PanelStyle; children: React.ReactNode }> = ({ style, children }) => {
  const frameSx = useMemo(() => getPanelFrameSx(style), [style]);
  const themeFn = useCallback((outer: Theme) => buildPanelTheme(outer, style ?? {}), [style]);
  const content = <PanelFrameContext.Provider value={frameSx}>{children}</PanelFrameContext.Provider>;
  return style && hasThemeOverrides(style) ? <ThemeProvider theme={themeFn}>{content}</ThemeProvider> : content;
};
