import { AutoPoiMapPanel as AutoPoiMapPanelType } from '@/types/StoryConfig';
import { getLayerLegendIconDataUrl } from './legend-utils';
import { evaluatePoiFilter } from './poiFilter';
import '@/types/GeoView'; // Import GeoView global types

export interface ResolvedPoi {
  title?: string;
  text?: string;
  images?: string[]; // Parsed from imageField, which may hold several semicolon-separated URLs
  linkUrl?: string;
  iconDataUrl?: string; // This feature's own rendered style swatch, not a single shared layer icon
  extent: Extent;
  sortValue?: string | number;
}

// A feature's imageField value may hold multiple photos separated by ';' (e.g. "a.jpg;b.jpg")
const parseImageField = (raw: unknown): string[] | undefined => {
  if (typeof raw !== 'string' || !raw.trim()) return undefined;
  const urls = raw.split(';').map((url) => url.trim()).filter(Boolean);
  return urls.length > 0 ? urls : undefined;
};

const sortPois = (pois: ResolvedPoi[], panel: AutoPoiMapPanelType): ResolvedPoi[] => {
  if (!panel.sortField) return pois;
  const direction = panel.sortDirection === 'desc' ? -1 : 1;
  return [...pois].sort((a, b) => {
    if (a.sortValue === undefined || b.sortValue === undefined) return 0;
    if (a.sortValue < b.sortValue) return -1 * direction;
    if (a.sortValue > b.sortValue) return 1 * direction;
    return 0;
  });
};

/**
 * Fetches every feature from `panel.layerId` and turns each into a POI card's worth of data.
 * Split out of AutoPoiMapPanel's feature-fetch effect so the transform logic is testable/readable
 * on its own, separate from the effect's mount/loading/pending-load plumbing.
 */
export const buildPoisFromLayer = async (mapViewer: GeoviewMapViewer, panel: AutoPoiMapPanelType): Promise<ResolvedPoi[]> => {
  const layer = mapViewer.controllers.layerController.getGeoviewLayer(panel.layerId);
  if (!layer) {
    throw new Error(`Layer not found: ${panel.layerId}`);
  }

  // triggerGetAllFeatureInfo (rather than reading the OL source directly) gives each feature
  // its own rendered featureIcon, which correctly varies per uniqueValue/classBreaks style class -
  // a single shared layer legend icon can't do that.
  const { results } = await mapViewer.controllers.layerSetController.triggerGetAllFeatureInfo(panel.layerId, true);

  // Fallback only for features triggerGetAllFeatureInfo couldn't style (e.g. no matching class)
  const fallbackIconDataUrl = getLayerLegendIconDataUrl(layer);

  const resolved: ResolvedPoi[] = [];
  for (const entry of results) {
    if (!entry.extent) continue;

    const values: Record<string, unknown> = {};
    for (const [fieldName, field] of Object.entries(entry.fieldInfo)) {
      values[fieldName] = field?.value;
    }

    if (panel.filter && !evaluatePoiFilter(values, panel.filter)) continue;

    resolved.push({
      title: panel.titleField ? (values[panel.titleField] as string | undefined) : undefined,
      text: panel.textField ? (values[panel.textField] as string | undefined) : undefined,
      images: panel.imageField ? parseImageField(values[panel.imageField]) : undefined,
      linkUrl: panel.linkField ? (values[panel.linkField] as string | undefined) : undefined,
      iconDataUrl: entry.featureIcon ?? fallbackIconDataUrl,
      extent: entry.extent,
      sortValue: panel.sortField ? (values[panel.sortField] as string | number | undefined) : undefined,
    });
  }

  return sortPois(resolved, panel);
};
