// Maps an author-facing map panel `id` (MapPanel.id / ManualPoiMapPanel.id / AutoPoiMapPanel.id)
// to the real, auto-generated GeoView mapId for that panel instance - the real mapId can't be
// predicted/authored (see mapId.ts's buildMapId), so Interaction.mapId targets this stable alias
// instead. A plain module-level map (not store state) since nothing needs to re-render when an
// alias changes; only `runInteraction` reads it, imperatively, at click time.
const aliasToMapId = new Map<string, string>();

/** Registers (or updates) the real GeoView mapId for an author-facing map panel `id`. Call this
 * as early as possible (mount-time effect) - registration doesn't require the map to be ready. */
export const registerMapAlias = (authorId: string, mapId: string): void => {
  aliasToMapId.set(authorId, mapId);
};

/** Unregisters a map alias (e.g. on panel unmount) so a stale mapId can't be resolved later. */
export const unregisterMapAlias = (authorId: string): void => {
  aliasToMapId.delete(authorId);
};

/** Resolves an author-facing map `id` (Interaction.mapId) to the real GeoView mapId, if registered. */
export const resolveMapAlias = (authorId: string): string | undefined => aliasToMapId.get(authorId);
