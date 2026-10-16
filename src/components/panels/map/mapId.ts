// Combines a type prefix, panelInstanceId, and the map config path (which contains `/`/`.` -
// not safe to use raw as a CSS id selector) into one plain alphanumeric token.
const sanitize = (value: string): string => value.replace(/[^a-zA-Z0-9]/g, '_');

export const buildMapId = (prefix: string, panelInstanceId: string | undefined, configPath: string): string =>
  `${prefix}_${sanitize(panelInstanceId || 'panel')}_${sanitize(configPath)}`;

/**
 * Resolves a map-capable panel's real GeoView/DOM map id. An author-provided `id` is used
 * directly, verbatim, so an Interaction.mapId can reference it exactly as typed, with no
 * separate alias bookkeeping; otherwise falls back to an auto-generated, per-instance id.
 * A duplicate author `id` is a config mistake, not something this papers over - GeoView will
 * surface it the same way any other duplicate map id would.
 */
export const resolveMapId = (prefix: string, panelInstanceId: string | undefined, panel: { id?: string; config: string }): string =>
  panel.id || buildMapId(prefix, panelInstanceId, panel.config);
