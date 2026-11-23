import { createTheme, Theme } from '@mui/material/styles';
import { StoryThemeConfig } from '@/types/StoryConfig';

export type GeoviewThemeName = 'dark' | 'light' | 'geo.ca' | 'canada.ca';

export interface OverlayPaletteColor {
  main: string;
  hover: string;
  contrastText: string;
}

declare module '@mui/material/styles' {
  interface Theme {
    // The GeoView map theme to sync to, resolved from the story's own theme config
    geoviewTheme: GeoviewThemeName;
  }
  interface ThemeOptions {
    geoviewTheme?: GeoviewThemeName;
  }
  // Background for controls drawn on top of photos/video - usable in sx as 'overlay.main' etc.
  interface Palette {
    overlay: OverlayPaletteColor;
  }
  interface PaletteOptions {
    overlay?: Partial<OverlayPaletteColor>;
  }
}

const DEFAULT_THEME_NAME = 'light';

// Dark in both light and dark mode, since it sits over an arbitrary photo rather than the page -
// 0.55 keeps white text on it at >= 4.5:1 even over a pure white image.
const DEFAULT_OVERLAY: OverlayPaletteColor = {
  main: 'rgba(0, 0, 0, 0.55)',
  hover: 'rgba(0, 0, 0, 0.75)',
  contrastText: '#ffffff',
};

/** Built-in themes, selectable by name from a story config's `theme` field. */
export const namedThemes: Record<string, StoryThemeConfig> = {
  light: {
    mode: 'light',
    primaryColor: '#1976d2',
    secondaryColor: '#dc004e',
    backgroundColor: '#f5f5f5',
    paperColor: '#ffffff',
    textColor: '#1a1a1a',
    geoviewTheme: 'geo.ca',
  },
  dark: {
    mode: 'dark',
    primaryColor: '#90caf9',
    secondaryColor: '#f48fb1',
    backgroundColor: '#121212',
    paperColor: '#1e1e1e',
    textColor: '#ffffff',
    geoviewTheme: 'dark',
  },
};

const DEFAULT_FONT_FAMILY = '"Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif';

/** The visitor's OS/browser color scheme preference, read once at build time (no live switching). */
const getSystemPreferredThemeName = (): 'light' | 'dark' =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : DEFAULT_THEME_NAME;

/**
 * Builds a MUI theme from a story config's `theme` field: a built-in theme
 * name, a custom theme object (optionally based on a named one via `name`),
 * or nothing - in which case it honours the visitor's OS/browser preference
 * instead of forcing light, since the author made no explicit choice.
 */
export const buildStoryTheme = (themeConfig?: string | StoryThemeConfig): Theme => {
  const defaultName = themeConfig === undefined ? getSystemPreferredThemeName() : DEFAULT_THEME_NAME;
  const requested: StoryThemeConfig = typeof themeConfig === 'string' ? { name: themeConfig } : themeConfig || {};
  const base = namedThemes[requested.name ?? defaultName] ?? namedThemes[DEFAULT_THEME_NAME];
  const resolved: StoryThemeConfig = { ...base, ...requested };
  // Falls back to a mode-based guess since GeoView only has 4 fixed theme
  // names of its own and can't otherwise infer one from an arbitrary custom theme.
  const geoviewTheme: GeoviewThemeName = resolved.geoviewTheme ?? (resolved.mode === 'dark' ? 'dark' : 'geo.ca');

  return createTheme({
    geoviewTheme,
    palette: {
      mode: resolved.mode,
      ...(resolved.primaryColor && { primary: { main: resolved.primaryColor } }),
      ...(resolved.secondaryColor && { secondary: { main: resolved.secondaryColor } }),
      background: {
        ...(resolved.backgroundColor && { default: resolved.backgroundColor }),
        ...(resolved.paperColor && { paper: resolved.paperColor }),
      },
      ...(resolved.textColor && { text: { primary: resolved.textColor } }),
      overlay: {
        ...DEFAULT_OVERLAY,
        ...(resolved.overlayColor && { main: resolved.overlayColor }),
        ...(resolved.overlayHoverColor && { hover: resolved.overlayHoverColor }),
      },
    },
    typography: {
      fontFamily: resolved.fontFamily ?? DEFAULT_FONT_FAMILY,
      h2: { fontSize: '3rem', '@media (max-width:600px)': { fontSize: '2rem' } },
      h4: { fontSize: '2rem', '@media (max-width:600px)': { fontSize: '1.5rem' } },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          html: { scrollBehavior: 'smooth' },
          body: {
            scrollbarWidth: 'thin',
            scrollbarColor: '#888 #f1f1f1',
            '&::-webkit-scrollbar': { width: '10px' },
            '&::-webkit-scrollbar-track': { background: '#f1f1f1' },
            '&::-webkit-scrollbar-thumb': { background: '#888', borderRadius: '5px' },
            '&::-webkit-scrollbar-thumb:hover': { background: '#555' },
          },
        },
      },
    },
  });
};
