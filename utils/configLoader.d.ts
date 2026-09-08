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
/**
 * Whether any slide panel needs a GeoView map, so callers can skip
 * cgpv setup entirely for map-free stories. Only checks top-level panels
 * since slideshow/dynamic panel types don't support maps yet.
 */
export declare const configHasMaps: (config: StoryConfig) => boolean;
//# sourceMappingURL=configLoader.d.ts.map