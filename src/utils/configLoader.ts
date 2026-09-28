import { Panel, StoryConfig } from '@/types/StoryConfig';

/**
 * Normalizes a slide's `panel` field to always be an array of rows: a flat `Panel[]` (the common
 * case, one row) becomes a single-row array; an already-nested `Panel[][]` (several stacked rows
 * under one title) is returned as-is.
 */
export const getSlideRows = (panel: Panel[] | Panel[][]): Panel[][] => {
  if (panel.length === 0) return [];
  return Array.isArray(panel[0]) ? (panel as Panel[][]) : [panel as Panel[]];
};

/** Panel types whose height varies with their own (possibly long) content - the opposite of a
 * "companion" panel type below. */
const isFlowingPanel = (panel: Panel): boolean => panel.type === 'text' || panel.type === 'group';

/**
 * Whether a row pairs at least one "flowing" panel (text, or a group - which can itself be an
 * arbitrarily tall stack of panels) with at least one other ("companion") panel of any other
 * type. Rows like this get the classic sticky-media-beside-scrolling-text treatment in
 * `getPanelSx` (story-styles.ts): the companion panel(s) stay pinned in view while the flowing
 * panel(s) scroll past, generalized to work for any companion type (image, map, video, quote,
 * doormat, etc.), not just media - and for a group standing in for text as the flowing side.
 */
export const rowHasFlowingPairing = (row: Panel[]): boolean =>
  row.length > 1 && row.some(isFlowingPanel) && row.some(p => !isFlowingPanel(p));


/**
 * Load and parse story configuration from JSON file
 */
export const loadStoryConfig = async (configPath: string): Promise<StoryConfig> => {
  const response = await fetch(configPath);
  if (!response.ok) {
    throw new Error(`Failed to load config: ${response.statusText}`);
  }
  return response.json();
};

/**
 * Generate slide ID from index and title, preferring a stable author-assigned
 * `id` over the title itself so deep links keep working across translations.
 */
export const generateSlideId = (index: number, title: string, id?: string): string => {
  const sanitizedTitle = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  return `${index}-${id ?? sanitizedTitle}`;
};

/**
 * Validate story configuration
 */
export const validateStoryConfig = (config: StoryConfig): boolean => {
  if (!config.slides || config.slides.length === 0) {
    console.error('Invalid story config: missing required fields');
    return false;
  }
  return true;
};

/** Whether a single panel is (or, for a group panel, recursively contains) a map panel. */
const panelHasMap = (panel: Panel): boolean =>
  panel.type === 'map' || panel.type === 'manual-poi-map' || panel.type === 'auto-poi-map' ||
  (panel.type === 'group' && getSlideRows(panel.panel).some(row => row.some(panelHasMap)));

/**
 * Whether any slide panel needs a GeoView map, so callers can skip
 * cgpv setup entirely for map-free stories. Recurses into group panels
 * since a map can be nested arbitrarily deep inside one.
 */
export const configHasMaps = (config: StoryConfig): boolean =>
  config.slides.some(slide =>
    getSlideRows(slide.panel).some(row => row.some(panelHasMap))
  );

