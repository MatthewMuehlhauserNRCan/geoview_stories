import { StoryConfig } from '@/types/StoryConfig';

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
 * Generate slide ID from index and title
 */
export const generateSlideId = (index: number, title: string): string => {
  const sanitizedTitle = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  return `${index}-${sanitizedTitle}`;
};

/**
 * Validate story configuration
 */
export const validateStoryConfig = (config: StoryConfig): boolean => {
  if (!config.title || !config.slides || config.slides.length === 0) {
    console.error('Invalid story config: missing required fields');
    return false;
  }
  return true;
};

/**
 * Whether any slide panel needs a GeoView map, so callers can skip
 * cgpv setup entirely for map-free stories. Only checks top-level panels
 * since slideshow/dynamic panel types don't support maps yet.
 */
export const configHasMaps = (config: StoryConfig): boolean =>
  config.slides.some(slide => slide.panel.some(panel => panel.type === 'map' || panel.type === 'interactive-map'));

