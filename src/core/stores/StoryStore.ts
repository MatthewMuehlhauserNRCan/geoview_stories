import { createStore, type StoreApi } from 'zustand/vanilla';
import { useStore } from 'zustand';
import { StoryConfig } from '@/types/StoryConfig';

export interface StoryState {
  config: StoryConfig | null;
  isInitialized: boolean;
  isLoading: boolean; // Story starts in a loading state until the controller loads a config
  error: string | null;
  activeSlideIndex: number;
  mapReadyStates: Record<string, boolean>;

  setConfig: (config: StoryConfig) => void;
  setInitialized: (initialized: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setActiveSlideIndex: (index: number) => void;
  setMapReady: (mapId: string, ready: boolean) => void;
  reset: () => void;
}

const initialState = {
  config: null,
  isInitialized: false,
  isLoading: true,
  error: null,
  activeSlideIndex: 0,
  mapReadyStates: {},
};

/**
 * StoryStore - holds and manages story state, following GeoView's zustand pattern.
 * A single module-level store since only one story runs per page for now.
 */
export const storyStore: StoreApi<StoryState> = createStore<StoryState>((set) => ({
  ...initialState,
  setConfig: (config) => set({ config }),
  setInitialized: (isInitialized) => set({ isInitialized }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setActiveSlideIndex: (activeSlideIndex) => set({ activeSlideIndex }),
  setMapReady: (mapId, ready) => set((state) => ({ mapReadyStates: { ...state.mapReadyStates, [mapId]: ready } })),
  reset: () => set({ ...initialState, mapReadyStates: {} }),
}));

// #region STATE GETTERS & HOOKS
// Getters read the current value once - safe to call from outside React (e.g. controllers).
// Hooks subscribe a component to that value and re-render it when it changes.
// Listed in getter+hook pairs for the same value, following GeoView's store convention.

/** Returns the current story config, or null before it's loaded. */
export const getStoryConfig = (): StoryConfig | null => storyStore.getState().config;
/** Selects the story config from the store. */
export const useStoryConfig = (): StoryConfig | null => useStore(storyStore, (state) => state.config);

/** Returns whether the story has finished initializing (config loaded, maps ready). */
export const getStoryInitialized = (): boolean => storyStore.getState().isInitialized;
/** Selects whether the story has finished initializing from the store. */
export const useStoryInitialized = (): boolean => useStore(storyStore, (state) => state.isInitialized);

/** Returns whether the story is still loading its config. */
export const getStoryLoading = (): boolean => storyStore.getState().isLoading;
/** Selects the story's loading state from the store. */
export const useStoryLoading = (): boolean => useStore(storyStore, (state) => state.isLoading);

/** Returns the current story error message, or null if there isn't one. */
export const getStoryError = (): string | null => storyStore.getState().error;
/** Selects the story's error message from the store. */
export const useStoryError = (): string | null => useStore(storyStore, (state) => state.error);

/** Returns the index of the currently active slide. */
export const getActiveSlideIndex = (): number => storyStore.getState().activeSlideIndex;
/** Selects the active slide index from the store. */
export const useActiveSlideIndex = (): number => useStore(storyStore, (state) => state.activeSlideIndex);

/** Returns whether the given GeoView map has finished initializing. */
export const getMapReady = (mapId: string): boolean => storyStore.getState().mapReadyStates[mapId] ?? false;
/**
 * Selects whether the given GeoView map is ready. cgpv.onMapReady is a single global callback
 * slot (not a per-listener pub/sub), so only StoryController is allowed to call it directly;
 * this hook reads the per-map ready state that the controller mirrors into the store instead.
 */
export const useMapReady = (mapId: string): boolean =>
  useStore(storyStore, (state) => state.mapReadyStates[mapId] ?? false);

/** Convenience hook for the handful of fields StoryViewer needs together; re-renders only when one of them changes. */
export const useStoryStore = () => ({
  config: useStoryConfig(),
  loading: useStoryLoading(),
  error: useStoryError(),
  initialized: useStoryInitialized(),
  activeSlideIndex: useActiveSlideIndex(),
});
// #endregion STATE GETTERS & HOOKS

// #region STATE ADAPTORS
// Imperative setters - meant to be called from non-React code (controllers) as well as React.

/** Sets the story config in the store. */
export const setStoryConfig = (config: StoryConfig): void => storyStore.getState().setConfig(config);
/** Sets whether the story has finished initializing. */
export const setStoryInitialized = (initialized: boolean): void => storyStore.getState().setInitialized(initialized);
/** Sets the story's loading state. */
export const setStoryLoading = (loading: boolean): void => storyStore.getState().setLoading(loading);
/** Sets the story's error message. */
export const setStoryError = (error: string | null): void => storyStore.getState().setError(error);
/** Sets the index of the currently active slide. */
export const setActiveSlideIndex = (index: number): void => storyStore.getState().setActiveSlideIndex(index);
/** Sets whether the given GeoView map has finished initializing. */
export const setMapReady = (mapId: string, ready: boolean): void => storyStore.getState().setMapReady(mapId, ready);
/** Resets the story store back to its initial state. */
export const resetStoryStore = (): void => storyStore.getState().reset();
// #endregion STATE ADAPTORS


