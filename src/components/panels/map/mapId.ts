// No hyphens: GeoView's legacy keyboard-focus code derives the map ID by
// splitting the shell element's DOM id on '-', so a hyphen here breaks it.
export const buildMapId = (prefix: string, panelInstanceId: string | undefined, configPath: string): string =>
  `${prefix}_${(panelInstanceId || 'panel').replace(/[^a-zA-Z0-9]/g, '_')}_${configPath.replace(/[^a-zA-Z0-9]/g, '_')}`;
