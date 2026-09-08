import { createStore, type StoreApi } from 'zustand/vanilla';
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

