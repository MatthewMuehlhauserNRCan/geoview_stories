import { StoryConfig } from '@/types/StoryConfig';
/**
 * Load and parse story configuration from JSON file
 */
export declare const loadStoryConfig: (configPath: string) => Promise<StoryConfig>;
/**
 * Generate slide ID from index and title
 */
export declare const generateSlideId: (index: number, title: string) => string;
/**
 * Validate story configuration
 */
export declare const validateStoryConfig: (config: StoryConfig) => boolean;
//# sourceMappingURL=configLoader.d.ts.map