import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, Paper, Stack, useTheme } from '@mui/material';
import { AutoPoiMapPanel as AutoPoiMapPanelType } from '@/types/StoryConfig';
import { useStoryConfig, incrementPendingLoad, decrementPendingLoad } from '@/core/stores/StoryStore';
import { MapLoadingOverlay, MapScrollGuardOverlay } from './MapOverlays';
import { getSxClasses as getSharedSxClasses } from './map-shared-style';
import { getSxClasses } from './poi/poi-style';
import { useMapLifecycle } from './hooks/useMapLifecycle';
import { usePreserveScrollOnGrowth } from './hooks/usePreserveScrollOnGrowth';
import { usePoiScrollObserver } from './poi/usePoiScrollObserver';
import { zoomToPoiTarget } from './poi/poiZoom';
import { getLayerLegendIconDataUrl } from './poi/legend-utils';
import { evaluatePoiFilter } from './poi/poiFilter';
import { PoiCard } from './poi/PoiCard';
import '@/types/GeoView'; // Import GeoView global types

interface AutoPoiMapPanelProps {
  panel: AutoPoiMapPanelType;
  panelInstanceId?: string;
}

interface ResolvedPoi {
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

export const AutoPoiMapPanel: React.FC<AutoPoiMapPanelProps> = ({ panel, panelInstanceId }) => {
  // No hyphens: GeoView's legacy keyboard-focus code derives the map ID by
  // splitting the shell element's DOM id on '-', so a hyphen here breaks it.
  const mapId = `autopoimap_${(panelInstanceId || 'panel').replace(/[^a-zA-Z0-9]/g, '_')}_${panel.config.replace(/[^a-zA-Z0-9]/g, '_')}`;

  const mapInstanceRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pendingLoadRegisteredRef = useRef(false);
  const [pois, setPois] = useState<ResolvedPoi[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const shared = getSharedSxClasses();
  const ownClasses = getSxClasses();
  const geoviewTheme = useTheme().geoviewTheme;
  const lang = useStoryConfig()?.lang ?? 'en';
  const { error, loading, showScrollGuard } = useMapLifecycle(mapId, panel.scrollguard, geoviewTheme);

  // Registered as early (mount) as possible, well before the map/fetch below even starts - so a
  // scroll-to-slide waiting on `waitForPendingLoadsCleared` can never race ahead of this panel
  // announcing it has known async content coming.
  useEffect(() => {
    if (pendingLoadRegisteredRef.current) return;
    pendingLoadRegisteredRef.current = true;
    incrementPendingLoad();
  }, []);

  // Once the map is ready, pull every feature from the configured layer and turn each into a POI
  useEffect(() => {
    if (loading) return;

    const mapViewer = window.cgpv?.api.getMapViewer(mapId);
    if (!mapViewer) {
      // No fetch will ever start to clear the pendingLoad flag registered on mount - clear it here
      // instead, so a stuck/missing map viewer can't leave scrollToSlide waiting for nothing.
      if (pendingLoadRegisteredRef.current) {
        pendingLoadRegisteredRef.current = false;
        decrementPendingLoad();
      }
      return;
    }
    mapInstanceRef.current = mapViewer;

    (async () => {
      try {
        try {
          await mapViewer.layer.waitForLayersLoaded();
        } catch (err) {
          console.warn('[AutoPoiMap] Layer loading timeout or error:', err);
        }

        const layer = mapViewer.controllers.layerController.getGeoviewLayer(panel.layerId);
        if (!layer) {
          setFetchError(`Layer not found: ${panel.layerId}`);
          return;
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

        if (panel.sortField) {
          const direction = panel.sortDirection === 'desc' ? -1 : 1;
          resolved.sort((a, b) => {
            if (a.sortValue === undefined || b.sortValue === undefined) return 0;
            if (a.sortValue < b.sortValue) return -1 * direction;
            if (a.sortValue > b.sortValue) return 1 * direction;
            return 0;
          });
        }

        setPois(resolved);
      } catch (err) {
        console.error('[AutoPoiMap] Error building POIs from features:', err);
        setFetchError(err instanceof Error ? err.message : String(err));
      } finally {
        if (pendingLoadRegisteredRef.current) {
          pendingLoadRegisteredRef.current = false;
          decrementPendingLoad();
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, mapId]);

  const zoomToPoiOnMap = async (index: number): Promise<void> => {
    const mapViewer = mapInstanceRef.current;
    const poi = pois[index];
    if (!mapViewer || !poi) return;

    const zoom = panel.scale ? mapViewer.getZoomFromScale(panel.scale) : undefined;
    await zoomToPoiTarget(mapViewer, { extent: poi.extent, zoom }, panel.duration ?? 500);
  };

  const { poiRefs, activePoiIndex } = usePoiScrollObserver(pois.length, !loading, (index) => {
    zoomToPoiOnMap(index).catch((err) => console.error('[AutoPoiMap] Zoom failed:', err));
  });

  // The POI card list only exists once the async feature fetch resolves - if the user has already
  // scrolled past this panel by then, its sudden height keeps the page from jumping under them.
  usePreserveScrollOnGrowth(containerRef, [pois.length]);

  if (error || fetchError) {
    return (
      <Paper elevation={2} sx={[shared.paper, { backgroundColor: 'error.light' }]}>
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="error">
            {error || fetchError}
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Box ref={containerRef} sx={ownClasses.root(panel.mapPosition)}>
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
            {loading && <MapLoadingOverlay message="Loading map..." />}
            {showScrollGuard && panel.scrollguard && <MapScrollGuardOverlay />}
          </Box>
        </Paper>
      </Box>

      {/* Points of Interest List - Scrollable, one per feature in the layer */}
      {pois.length > 0 && (
        <Box sx={ownClasses.poiSection}>
          <Typography variant="h6" sx={ownClasses.poiSectionHeading}>
            Scroll through locations
          </Typography>
          <Stack sx={ownClasses.poiStack}>
            {pois.map((poi, index) => (
              <PoiCard
                key={index}
                index={index}
                title={poi.title}
                text={poi.text}
                images={poi.images}
                linkUrl={poi.linkUrl}
                linkLabel={panel.linkLabel}
                iconDataUrl={poi.iconDataUrl}
                isActive={activePoiIndex === index}
                cardRef={(el) => {
                  poiRefs.current[index] = el;
                }}
              />
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
};
