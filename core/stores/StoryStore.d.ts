import { type StoreApi } from 'zustand/vanilla';
import { StoryConfig } from '@/types/StoryConfig';
export interface StoryState {
    config: StoryConfig | null;
    isInitialized: boolean;
    isLoading: boolean;
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
/**
 * StoryStore - holds and manages story state, following GeoView's zustand pattern.
 * A single module-level store since only one story runs per page for now.
 */
export declare const storyStore: StoreApi<StoryState>;
//# sourceMappingURL=StoryStore.d.ts.map