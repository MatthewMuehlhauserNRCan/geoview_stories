import { StoryStore } from '../stores/StoryStore';
import { loadStoryConfig, configHasMaps } from '@/utils/configLoader';
import '@/types/GeoView'; // Import GeoView global types

/**
 * StoryController - Manages story lifecycle and map initialization
 * Follows GeoView pattern: controller without React dependencies
 * Can be called explicitly from anywhere (React or vanilla JS)
 */
export class StoryController {
  private static instance: StoryController;
  private store = StoryStore.getInstance();
  private containerElement: HTMLElement | null = null;

  private constructor() {}

  static getInstance(): StoryController {
    if (!StoryController.instance) {
      StoryController.instance = new StoryController();
    }
    return StoryController.instance;
  }

  /**
   * Initialize the story viewer
   * @param containerEl - HTML element to render into
   * @param configPath - Path to story config JSON or inline config
   */
  async init(containerEl: HTMLElement, configPath: string): Promise<void> {
    this.containerElement = containerEl;
    this.store.setLoading(true);
    this.store.setError(null);

    try {
      const config = await loadStoryConfig(configPath);
      this.store.setConfig(config);

      // Reveal the story now so slides (and any map elements) actually mount.
      // cgpv.init() only discovers elements already in the DOM, so this must
      // happen before we wait for/initialize maps below.
      this.store.setLoading(false);

      if (configHasMaps(config)) {
        if (!window.cgpv) {
          throw new Error('GeoView library not loaded');
        }

        // Maps render as children of the slides above, so wait for them to
        // exist before letting GeoView scan the DOM for them.
        await this.waitForMapElements();

        // cgpv.onMapReady is a single global callback slot, not a per-listener
        // pub/sub, so it must be registered once here (before init) rather than
        // by individual map panel components, which would otherwise overwrite
        // each other's callback.
        this.registerMapListeners();

        // GeoView will auto-discover all elements with class="geoview-map"
        await window.cgpv.init();
      }

      this.store.setInitialized(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.store.setError(errorMessage);
      this.store.setLoading(false);
      console.error('[StoryController] Initialization failed:', err);
      throw err;
    }
  }

  /**
   * Wait for all .geoview-map elements to appear in the DOM
   * Use MutationObserver to detect when map containers are rendered
   */
  private waitForMapElements(timeoutMs = 5000): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.querySelectorAll('.geoview-map').length > 0) {
        resolve();
        return;
      }

      const observer = new MutationObserver(() => {
        if (document.querySelectorAll('.geoview-map').length > 0) {
          clearTimeout(timeoutId);
          observer.disconnect();
          resolve();
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });

      const timeoutId = window.setTimeout(() => {
        observer.disconnect();
        reject(new Error('Timeout waiting for map elements'));
      }, timeoutMs);
    });
  }

  /**
   * Register the single global listener for map ready events
   */
  private registerMapListeners(): void {
    window.cgpv.onMapReady((mapViewer) => {
      this.store.setMapReady(mapViewer.mapId, true);
    });
  }

  /**
   * Get the current store
   */
  getStore(): StoryStore {
    return this.store;
  }

  /**
   * Get container element
   */
  getContainerElement(): HTMLElement | null {
    return this.containerElement;
  }

  /**
   * Reset controller state
   */
  reset(): void {
    this.store.reset();
    this.containerElement = null;
  }
}

