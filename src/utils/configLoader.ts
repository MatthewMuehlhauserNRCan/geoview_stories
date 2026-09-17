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

/**
 * Whether any slide panel needs a GeoView map, so callers can skip
 * cgpv setup entirely for map-free stories. Only checks top-level panels
 * since the slideshow panel type doesn't support maps.
 */
export const configHasMaps = (config: StoryConfig): boolean =>
  config.slides.some(slide =>
    getSlideRows(slide.panel).some(row =>
      row.some(panel => panel.type === 'map' || panel.type === 'manual-poi-map' || panel.type === 'auto-poi-map')
    )
  );

