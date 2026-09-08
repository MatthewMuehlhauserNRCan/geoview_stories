import '@/types/GeoView';
/**
 * StoryController - Manages story lifecycle and map initialization
 * Follows GeoView pattern: controller without React dependencies
 * Can be called explicitly from anywhere (React or vanilla JS)
 */
export declare class StoryController {
    private static instance;
    private containerElement;
    private constructor();
    static getInstance(): StoryController;
    /**
     * Initialize the story viewer
     * @param containerEl - HTML element to render into
     * @param configPath - Path to story config JSON or inline config
     */
    init(containerEl: HTMLElement, configPath: string): Promise<void>;
    /**
     * Wait for all .geoview-map elements to appear in the DOM
     * Use MutationObserver to detect when map containers are rendered
     */
    private waitForMapElements;
    /**
     * Register the single global listener for map ready events
     */
    private registerMapListeners;
    /**
     * Get container element
     */
    getContainerElement(): HTMLElement | null;
    /**
     * Reset controller state
     */
    reset(): void;
}
//# sourceMappingURL=StoryController.d.ts.map