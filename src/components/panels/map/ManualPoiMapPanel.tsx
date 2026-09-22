import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, Paper, Stack, useTheme } from '@mui/material';
import { ManualPoiMapPanel as ManualPoiMapPanelType } from '@/types/StoryConfig';
import { useStoryConfig } from '@/core/stores/StoryStore';
import { MapLoadingOverlay, MapScrollGuardOverlay } from './MapOverlays';
import { getSxClasses as getSharedSxClasses } from './map-shared-style';
import { getSxClasses } from './poi/poi-style';
import { useMapLifecycle } from './hooks/useMapLifecycle';
import { usePoiScrollObserver } from './poi/usePoiScrollObserver';
import { zoomToPoiTarget } from './poi/poiZoom';
import { getLayerLegendIconDataUrl } from './poi/legend-utils';
import { PoiCard } from './poi/PoiCard';
import { buildMapId } from './mapId';
import '@/types/GeoView'; // Import GeoView global types

interface ManualPoiMapPanelProps {
  panel: ManualPoiMapPanelType;
  panelInstanceId?: string;
}

export const ManualPoiMapPanel: React.FC<ManualPoiMapPanelProps> = ({ panel, panelInstanceId }) => {
  const mapId = buildMapId('manualpoimap', panelInstanceId, panel.config);

  const mapInstanceRef = useRef<GeoviewMapViewer>(null);
  const featureDataRef = useRef<Map<number, { extent: Extent; fieldValue?: string; iconDataUrl?: string }>>(new Map());
  // Mutating featureDataRef alone doesn't trigger a re-render; bump this after
  // populating it so the POI cards actually pick up the fetched field values/icons.
  const [, setFeatureDataVersion] = useState(0);

  const shared = getSharedSxClasses();
  const ownClasses = getSxClasses();
  const geoviewTheme = useTheme().geoviewTheme;
  const lang = useStoryConfig()?.lang ?? 'en';
  const { error, loading, showScrollGuard } = useMapLifecycle(mapId, panel.scrollguard, geoviewTheme);

  // Once the map is ready, grab the viewer instance and fetch POI feature data
  useEffect(() => {
    if (!loading && window.cgpv) {
      const mapViewer = window.cgpv.api.getMapViewer(mapId);
      if (mapViewer) {
        mapInstanceRef.current = mapViewer;
        fetchFeatureData().catch((err) => {
          console.error('[ManualPoiMap] Feature data fetch error:', err);
          // Continue anyway - still mark as loaded
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, mapId]);

  const zoomToPoiOnMap = async (index: number): Promise<void> => {
    const poi = panel.points[index];
    const mapViewer = mapInstanceRef.current;
    if (!mapViewer) {
      console.warn('Map viewer not ready');
      return;
    }

    if (poi.target.returnHome) {
      await zoomToPoiTarget(mapViewer, { returnHome: true }, panel.duration ?? 500);
      return;
    }

    const featureData = featureDataRef.current.get(index);
    if (!featureData?.extent) {
      console.warn('No feature data available for POI', index);
      return;
    }

    // Zoom is either explicit, derived from scale, or falls back to the previous fixed default
    const zoom = poi.target.zoom ?? (poi.target.scale ? mapViewer.getZoomFromScale(poi.target.scale) : undefined);
    await zoomToPoiTarget(mapViewer, { extent: featureData.extent, zoom }, panel.duration ?? 500);
  };

  const { poiRefs, activePoiIndex } = usePoiScrollObserver(panel.points.length, !loading, (index) => {
    zoomToPoiOnMap(index).catch((err) => console.error('[ManualPoiMap] Zoom failed:', err));
  });

  const fetchFeatureData = async () => {
    const mapViewer = mapInstanceRef.current;
    if (!mapViewer) return;

    try {
      // Wait for all layers to be loaded before trying to access features
      try {
        await mapViewer.layer.waitForLayersLoaded();
      } catch (err) {
        console.warn('[ManualPoiMap] Layer loading timeout or error:', err);
      }

      for (let i = 0; i < panel.points.length; i++) {
        const poi = panel.points[i];

        // Skip if no layer/oid or if returnHome
        if (!poi.target.layerId || poi.target.oid === undefined || poi.target.returnHome) {
          continue;
        }

        try {
          // Get the layer (format: 'geoviewLayerId/layerId')
          const layer = mapViewer.controllers.layerController.getGeoviewLayer(poi.target.layerId);
          if (!layer) {
            console.warn(`Layer not found: ${poi.target.layerId}`);
            continue;
          }

          const source = layer.getOLSource();
          if (!source) {
            console.warn(`Source not found for layer: ${poi.target.layerId}`);
            continue;
          }

          const feature = source.getFeatureById(poi.target.oid);
          if (!feature) {
            console.warn(`Feature not found: OID ${poi.target.oid} in ${poi.target.layerId}`);
            continue;
          }

          // Extract field value if field is specified
          let fieldValue: string | undefined;
          if (poi.field && feature.values_) {
            fieldValue = feature.values_[poi.field];
          }

          const geom = feature.getGeometry();
          const extent = geom?.getExtent() as Extent | undefined;
          if (geom && extent) {
            featureDataRef.current.set(i, {
              extent,
              fieldValue: fieldValue?.toString(),
              iconDataUrl: getLayerLegendIconDataUrl(layer),
            });
          }
        } catch (err) {
          console.error(`Error fetching feature data for POI ${i}:`, err);
        }
      }
    } catch (err) {
      console.error('Error in fetchFeatureData:', err);
    }

    // Force a re-render so the POI cards pick up the freshly fetched data
    setFeatureDataVersion((v) => v + 1);
  };

  if (error) {
    return (
      <Paper elevation={2} sx={[shared.paper, { backgroundColor: 'error.light' }]}>
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="error">
            {error}
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Box sx={ownClasses.root(panel.mapPosition)}>
      {/* Map Container - Sticky on mobile and desktop */}
      <Box sx={ownClasses.mapWrapper}>
        <Paper elevation={2} sx={[shared.paper, ownClasses.mapPaper]}>
          <Box sx={ownClasses.mapBody}>
            <Box
              id={mapId}
              data-config-url={panel.config}
              data-lang={lang}
              className="geoview-map"
              sx={[shared.container, ownClasses.mapViewMinHeight]}
            />
            {loading && <MapLoadingOverlay message="Loading interactive map..." />}
            {showScrollGuard && panel.scrollguard && <MapScrollGuardOverlay />}
          </Box>
        </Paper>
      </Box>

      {/* Points of Interest List - Scrollable */}
      {panel.points && panel.points.length > 0 && (
        <Box sx={ownClasses.poiSection}>
          <Typography variant="h6" sx={ownClasses.poiSectionHeading}>
            Scroll through locations
          </Typography>
          <Stack sx={ownClasses.poiStack}>
            {panel.points.map((poi, index) => {
              // Live field value takes precedence; falls back to the author-provided label.
              const featureData = featureDataRef.current.get(index);
              const fieldValue = featureData?.fieldValue ?? (poi.target.value !== undefined ? String(poi.target.value) : undefined);
              return (
                <PoiCard
                  key={index}
                  index={index}
                  title={poi.title}
                  text={poi.text}
                  images={Array.isArray(poi.image) ? poi.image : poi.image ? [poi.image] : undefined}
                  altText={poi.altText}
                  fieldValue={fieldValue}
                  iconDataUrl={featureData?.iconDataUrl}
                  linkUrl={poi.linkUrl}
                  linkLabel={poi.linkLabel ?? panel.linkLabel}
                  isActive={activePoiIndex === index}
                  cardRef={(el) => {
                    poiRefs.current[index] = el;
                  }}
                />
              );
            })}
          </Stack>
        </Box>
      )}
    </Box>
  );
};
