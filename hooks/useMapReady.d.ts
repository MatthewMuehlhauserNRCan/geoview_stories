/**
 * Hook to track whether a specific GeoView map is ready.
 *
 * cgpv.onMapReady is a single global callback slot (not a per-listener pub/sub),
 * so only StoryController is allowed to call it directly. This hook reads the
 * per-map ready state that the controller mirrors into StoryStore instead.
 */
export declare const useMapReady: (mapId: string) => boolean;
//# sourceMappingURL=useMapReady.d.ts.map