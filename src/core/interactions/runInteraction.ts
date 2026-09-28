import { getStoryConfig } from '@/core/stores/StoryStore';
import { resolveMapAlias } from './mapRegistry';
import '@/types/GeoView'; // Import GeoView global types

const DEFAULT_DURATION = 500;

/** Looks up the extent (in map projection) of one feature via its layer path + object id - same
 * lookup ManualPoiMapPanel already does inline, kept separate here rather than shared/refactored
 * out of that component to avoid touching its (working) logic for this. */
const getFeatureExtent = (mapViewer: GeoviewMapViewer, layerId: string, oid: string | number): Extent | undefined => {
  const layer = mapViewer.controllers.layerController.getGeoviewLayer(layerId);
  const source = layer?.getOLSource();
  const feature = source?.getFeatureById(oid);
  return feature?.getGeometry()?.getExtent() as Extent | undefined;
};

/**
 * Executes one configured interaction (StoryConfig.interactions) by id - resolved from the current
 * story config, targeted at its map via the map-alias registry (mapRegistry.ts), and applied via
 * the matching GeoView call. Safe to call from any click handler (ButtonGroupPanel, a markdown
 * `#interaction:<id>` link) - logs and no-ops on failure rather than throwing, so one misconfigured
 * interaction can't break the page.
 */
export const runInteraction = async (interactionId: string): Promise<void> => {
  const interaction = getStoryConfig()?.interactions?.find((i) => i.id === interactionId);
  if (!interaction) {
    console.warn(`[runInteraction] No interaction configured with id "${interactionId}"`);
    return;
  }

  const realMapId = resolveMapAlias(interaction.mapId);
  if (!realMapId) {
    console.warn(`[runInteraction] No map registered with id "${interaction.mapId}" (interaction "${interactionId}")`);
    return;
  }

  if (!window.cgpv) {
    console.warn('[runInteraction] GeoView library not loaded');
    return;
  }

  try {
    // Waits for the target map to exist AND finish initializing, so an interaction triggered
    // before its map is ready (e.g. a button clicked very early) still runs once it's available.
    const mapViewer = await window.cgpv.api.waitForMapViewer(realMapId);

    switch (interaction.type) {
      case 'zoom-to-extent':
        await mapViewer.zoomToLonLatExtentOrCoordinate(interaction.extent, true, {
          maxZoom: interaction.zoom,
          duration: interaction.duration ?? DEFAULT_DURATION,
        });
        break;

      case 'zoom-to-point':
        await mapViewer.zoomToLonLatExtentOrCoordinate(interaction.center, true, {
          maxZoom: interaction.zoom,
          duration: interaction.duration ?? DEFAULT_DURATION,
        });
        break;

      case 'zoom-to-feature': {
        const extent = getFeatureExtent(mapViewer, interaction.layerId, interaction.oid);
        if (!extent) {
          console.warn(`[runInteraction] Feature not found: layer "${interaction.layerId}", oid "${interaction.oid}"`);
          break;
        }
        const zoom = interaction.zoom ?? (interaction.scale ? mapViewer.getZoomFromScale(interaction.scale) : undefined);
        await mapViewer.controllers.mapController.zoomToExtent(extent, true, {
          padding: [100, 100, 100, 100],
          maxZoom: zoom ?? 10,
          duration: interaction.duration ?? DEFAULT_DURATION,
        });
        break;
      }

      case 'zoom-to-layer-extent':
        await mapViewer.layer.zoomToLayerExtent(interaction.layerId, true);
        break;

      case 'zoom-to-initial-extent':
        await mapViewer.controllers.mapController.zoomToInitialExtent();
        break;

      case 'set-layer-visibility':
        mapViewer.layer.setOrToggleLayerVisibility(interaction.layerId, interaction.visible);
        break;

      case 'add-layer':
        mapViewer.layer.addGeoviewLayer(interaction.layerConfig);
        break;
    }
  } catch (err) {
    console.error(`[runInteraction] Failed to run interaction "${interactionId}":`, err);
  }
};
