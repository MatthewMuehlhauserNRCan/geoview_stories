import { StoryConfig } from '@/types/StoryConfig';

/**
 * Load and parse story configuration from JSON file
 */
export const loadStoryConfig = async (configPath: string): Promise<StoryConfig> => {
  try {
    const response = await fetch(configPath);
    if (!response.ok) {
      throw new Error(`Failed to load config: ${response.statusText}`);
    }
    const config: StoryConfig = await response.json();
    return config;
  } catch (error) {
    console.error('Error loading story configuration:', error);
    throw error;
  }
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
