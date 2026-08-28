import './styles/panels.css';
/**
 * Initialize a story viewer in the specified container
 * @param containerId - ID of the container element
 * @param configPath - Path to the story configuration JSON file
 */
declare function init(containerId: string, configPath: string): void;
/**
 * Destroy a story viewer instance
 * @param containerId - ID of the container element
 */
declare function destroy(containerId: string): void;
/**
 * Auto-initialize all elements with class "geoview-story"
 */
declare function autoInit(): void;
declare const api: {
    init: typeof init;
    destroy: typeof destroy;
    autoInit: typeof autoInit;
};
export default api;
declare global {
    interface Window {
        geoviewStory: {
            init: typeof init;
            destroy: typeof destroy;
            autoInit: typeof autoInit;
        };
    }
}
//# sourceMappingURL=index.d.ts.map