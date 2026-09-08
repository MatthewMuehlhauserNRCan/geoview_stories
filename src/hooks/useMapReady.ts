import { useStore } from 'zustand';
import { storyStore } from '@/core/stores/StoryStore';

/**
 * Hook to track whether a specific GeoView map is ready.
 *
 * cgpv.onMapReady is a single global callback slot (not a per-listener pub/sub),
 * so only StoryController is allowed to call it directly. This hook reads the
 * per-map ready state that the controller mirrors into StoryStore instead.
 */
export const useMapReady = (mapId: string): boolean =>
  useStore(storyStore, (state) => state.mapReadyStates[mapId] ?? false);

