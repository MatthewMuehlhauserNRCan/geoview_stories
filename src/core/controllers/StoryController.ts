import { setStoryLoading, setStoryError, setStoryConfig, setStoryInitialized, setMapReady, resetStoryStore } from '../stores/StoryStore';
import { loadStoryConfig, configHasMaps } from '@/utils/configLoader';
import '@/types/GeoView'; // Import GeoView global types

// Only one story runs per page for now (matching StoryStore, which is a single module-level
// store rather than a registry) - so this is a set of plain functions, not a class/singleton.
let containerElement: HTMLElement | null = null;

/** Wait for all .geoview-map elements to appear in the DOM, via MutationObserver. */
const waitForMapElements = (timeoutMs = 5000): Promise<void> => {
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
};

/** Register the single global listener for map ready events. */
const registerMapListeners = (): void => {
  window.cgpv.onMapReady((mapViewer) => {
    setMapReady(mapViewer.mapId, true);
  });
};

/**
 * Initialize the story viewer: loads the config, mounts slides, and (if the story has maps) waits
 * for their DOM elements before letting GeoView scan for and initialize them.
 * @param containerEl - HTML element to render into
 * @param configPath - Path to story config JSON or inline config
 */
export const initStory = async (containerEl: HTMLElement, configPath: string): Promise<void> => {
  containerElement = containerEl;
  setStoryLoading(true);
  setStoryError(null);

  try {
    const config = await loadStoryConfig(configPath);

    // A `data-theme` attribute on the story's outer container overrides the
    // config's own theme, so multiple HTML entry points can reuse one config
    // file with different themes instead of duplicating it. containerEl is
    // the React-rendered root React mounts inside the original element, so
    // its parent is that original container.
    const themeOverride = containerEl.parentElement?.dataset.theme;
    if (themeOverride) {
      config.theme = themeOverride;
    }

    setStoryConfig(config);

    // Reveal the story now so slides (and any map elements) actually mount.
    // cgpv.init() only discovers elements already in the DOM, so this must
    // happen before we wait for/initialize maps below.
    setStoryLoading(false);

    if (configHasMaps(config)) {
      if (!window.cgpv) {
        throw new Error('GeoView library not loaded');
      }

      // Maps render as children of the slides above, so wait for them to
      // exist before letting GeoView scan the DOM for them.
      await waitForMapElements();

      // cgpv.onMapReady is a single global callback slot, not a per-listener
      // pub/sub, so it must be registered once here (before init) rather than
      // by individual map panel components, which would otherwise overwrite
      // each other's callback.
      registerMapListeners();

      // GeoView will auto-discover all elements with class="geoview-map"
      await window.cgpv.init();
    }

    setStoryInitialized(true);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    setStoryError(errorMessage);
    setStoryLoading(false);
    console.error('[StoryController] Initialization failed:', err);
    throw err;
  }
};

/** Returns the container element passed to the most recent `initStory` call. */
export const getStoryContainerElement = (): HTMLElement | null => containerElement;

/** Resets both the story store and this controller's own container reference. */
export const resetStory = (): void => {
  resetStoryStore();
  containerElement = null;
};
