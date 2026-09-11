import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, Paper, Stack } from '@mui/material';
import { InteractiveMapPanel as InteractiveMapPanelType } from '@/types/StoryConfig';
import { useMapReady } from '@/hooks/useMapReady';
import { MapLoadingOverlay, MapScrollGuardOverlay } from './MapOverlays';
import { getSxClasses as getSharedSxClasses } from './map-shared-style';
import { getSxClasses } from './InteractiveMapPanel-style';
import '@/types/GeoView'; // Import GeoView global types

interface InteractiveMapPanelProps {
  panel: InteractiveMapPanelType;
  panelInstanceId?: string;
}

// Best-effort layer style swatch: exact per-feature class matching (for
// uniqueValue/classBreaks styles) needs GeoView's internal renderer logic,
// which isn't exposed externally, so this just takes the layer's default/first icon.
const getLayerLegendIconDataUrl = (layer: GeoviewLayer): string | undefined => {
  try {
    const legend = layer.getLegend?.()?.legend;
    if (!legend) return undefined;

    if (legend instanceof HTMLCanvasElement) {
      return legend.toDataURL();
    }

    for (const geometryStyle of Object.values(legend as Record<string, any>)) {
      const canvas = geometryStyle?.defaultCanvas ?? geometryStyle?.arrayOfCanvas?.[0];
      if (canvas instanceof HTMLCanvasElement) return canvas.toDataURL();
    }
  } catch (err) {
    console.warn('[InteractiveMap] Could not read layer legend:', err);
  }
  return undefined;
};

export const InteractiveMapPanel: React.FC<InteractiveMapPanelProps> = ({ panel, panelInstanceId }) => {
  const poiRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activePoiIndex, setActivePoiIndex] = useState<number | null>(null);
  const [showScrollGuard, setShowScrollGuard] = useState(false);
  
  // Use stable ID based on config path. No hyphens: GeoView's legacy
  // keyboard-focus code derives the map ID by splitting the shell element's
  // DOM id on '-', so a hyphen here breaks it.
  const mapId = `interactivemap_${(panelInstanceId || 'panel').replace(/[^a-zA-Z0-9]/g, '_')}_${panel.config.replace(/[^a-zA-Z0-9]/g, '_')}`;
  
  const mapInstanceRef = useRef<any>(null);
  const featureDataRef = useRef<Map<number, { extent: [number, number, number, number]; fieldValue?: string; iconDataUrl?: string }>>(
    new Map()
  );
  // Mirrors activePoiIndex for the IntersectionObserver callback, which reads
  // it via ref (not the closured state) so the observer never needs to be
  // torn down and recreated when the active POI changes.
  const activePoiIndexRef = useRef<number | null>(null);
  // Mutating featureDataRef alone doesn't trigger a re-render; bump this after
  // populating it so the POI cards actually pick up the fetched field values/icons.
  const [featureDataVersion, setFeatureDataVersion] = useState(0);
  const mapReady = useMapReady(mapId);
  const loading = !error && !mapReady;
  const shared = getSharedSxClasses();
  const ownClasses = getSxClasses();

  // cgpv.onMapReady is a single global callback slot owned by StoryController;
  // this only checks that the library itself loaded.
  useEffect(() => {
    if (!window.cgpv) {
      setError('GeoView library not loaded');
    }
  }, []);

  // Once the map is ready, grab the viewer instance and fetch POI feature data
  useEffect(() => {
    if (!mapReady) return;

    const mapViewer = window.cgpv.api.getMapViewer(mapId);
    if (!mapViewer) return;

    mapInstanceRef.current = mapViewer;
    fetchFeatureData().catch(err => {
      console.error('[InteractiveMap] Feature data fetch error:', err);
      // Continue anyway - still mark as loaded
    });
  }, [mapReady, mapId]);


  // Set up IntersectionObserver for scroll-triggered POI animations
  useEffect(() => {    
    if (loading || !panel.points.length) return;

    // Check if mobile or desktop for rootMargin adjustment
    const isMobile = window.matchMedia('(max-width: 899px)').matches; // MUI 'md' breakpoint is 900px

    const observerOptions = {
      root: null,
      // On mobile, account for sticky map at top (40vh), trigger when POI is in visible area below map
      // On desktop, trigger when POI is in center 30% of viewport
      rootMargin: isMobile ? '-45% 0px -20% 0px' : '-35% 0px -35% 0px',
      threshold: 0.5, // Trigger when 50% visible
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Find which POI is intersecting
          const index = poiRefs.current.findIndex((ref) => ref === entry.target);
          if (index !== -1 && index !== activePoiIndexRef.current) {
            // Update the ref immediately so a second entry in this same batch
            // (e.g. one POI exiting as another enters) sees the fresh value.
            activePoiIndexRef.current = index;
            setActivePoiIndex(index);
            zoomToPoiOnMap(index).catch((err) => console.error('[InteractiveMap] Zoom failed:', err));
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observe all POI cards
    poiRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      observer.disconnect();
    };
  }, [loading, panel.points]);

  // Scroll guard to prevent accidental zooming
  useEffect(() => {
    if (!panel.scrollguard) return;

    let scrollGuardTimeoutRef: number | null = null;
    const mapElement = document.getElementById(mapId);
    if (!mapElement) return;

    const handleWheel = (e: WheelEvent) => {
      // Allow zoom if Ctrl (Windows/Linux) or Cmd (Mac) is pressed
      if (e.ctrlKey || e.metaKey) {
        setShowScrollGuard(false);
        return;
      }

      // Prevent map zoom
      e.preventDefault();
      e.stopPropagation();
      
      // Show scroll guard overlay
      setShowScrollGuard(true);
      
      // Clear existing timeout
      if (scrollGuardTimeoutRef) {
        window.clearTimeout(scrollGuardTimeoutRef);
      }
      
      // Hide overlay after 1.5 seconds
      scrollGuardTimeoutRef = window.setTimeout(() => {
        setShowScrollGuard(false);
      }, 1500);
    };

    // Use capture phase to intercept before GeoView's handlers
    mapElement.addEventListener('wheel', handleWheel, { passive: false, capture: true });

    return () => {
      mapElement.removeEventListener('wheel', handleWheel, { capture: true });
      if (scrollGuardTimeoutRef) {
        window.clearTimeout(scrollGuardTimeoutRef);
      }
    };
  }, [panel.scrollguard, mapId]);

  const fetchFeatureData = async () => {
    if (!mapInstanceRef.current) return;

    try {
      const mapViewer = window.cgpv.api.getMapViewer(mapId);
      if (!mapViewer) return;

      // Wait for all layers to be loaded before trying to access features
      try {
        await mapViewer.layer.waitForLayersLoaded();
      } catch (err) {
        console.warn('[InteractiveMap] Layer loading timeout or error:', err);
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

          // Get the OpenLayers source
          const source = layer.getOLSource();
          if (!source) {
            console.warn(`Source not found for layer: ${poi.target.layerId}`);
            continue;
          }

          // Get feature by ObjectID
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

          // Get geometry extent
          const geom = feature.getGeometry();
          const extent = geom.getExtent() as [number, number, number, number];
          if (geom && extent) {
            featureDataRef.current.set(i, {
              extent: extent,
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

  const zoomToPoiOnMap = (index: number): Promise<void> => {
    const poi = panel.points[index];

    if (!mapInstanceRef.current) {
      console.warn('Map instance not ready');
      return Promise.resolve();
    }

    try {
      const mapViewer = window.cgpv.api.getMapViewer(mapId);
      if (!mapViewer) {
        console.warn('Map viewer not found');
        return Promise.resolve();
      }

      // Cancel whatever fit/animation is still in-flight from the previous POI
      // first - back-to-back zoomToExtent/zoomToInitialExtent calls otherwise
      // fight each other instead of the latest one cleanly winning.
      mapViewer.getView().cancelAnimations();

      if (poi.target.returnHome) {
        // Return to home extent
        return mapViewer.controllers.mapController.zoomToInitialExtent();
      }

      // Check if we have cached feature data
      const featureData = featureDataRef.current.get(index);
      if (featureData?.extent) {
        // Zoom is either explicit, derived from scale, or falls back to the previous fixed default
        const targetZoom = poi.target.zoom ?? (poi.target.scale ? mapViewer.getZoomFromScale(poi.target.scale) : undefined);
        const fitOptions = {
          padding: [100, 100, 100, 100] as [number, number, number, number],
          maxZoom: targetZoom ?? 10,
          duration: panel.duration ?? 500,
        };
        return mapViewer.controllers.mapController.zoomToExtent(featureData.extent, true, fitOptions);
      }

      console.warn('No feature data available for POI', index);
      return Promise.resolve();
    } catch (err) {
      console.error('Error zooming to POI:', err);
      return Promise.resolve();
    }
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
    <Box sx={ownClasses.root}>
      {/* Map Container - Sticky on mobile and desktop */}
      <Box sx={ownClasses.mapWrapper}>
        <Paper elevation={2} sx={[shared.paper, ownClasses.mapPaper]}>
          {panel.title && (
            <Box sx={shared.titleBar}>
              <Typography variant="h5" component="h3" sx={{ fontWeight: 600 }}>
                {panel.title}
              </Typography>
            </Box>
          )}
          <Box sx={ownClasses.mapBody(!!panel.title)}>
            <Box
              id={mapId}
              data-config-url={panel.config}
              data-lang="en"
              className="geoview-map"
              sx={[shared.container, { height: '100%' }]}
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
            {panel.points.map((poi, index) => (
              <Paper
                key={index}
                ref={(el) => {
                  poiRefs.current[index] = el;
                }}
                elevation={activePoiIndex === index ? 4 : 1}
                sx={ownClasses.poiCard(activePoiIndex === index)}
              >
                {/* Icon: POI photo with a numbered pin badge, or just the pin badge on its own */}
                <Box sx={ownClasses.poiIconWrapper}>
                  {poi.image ? (
                    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                      <Box component="img" src={poi.image} alt={poi.altText || poi.title || ''} sx={ownClasses.poiImage} />
                      <Box sx={ownClasses.poiPinBadge(true)}>
                        <Typography variant="body2" color="primary.main" sx={{ fontWeight: 700 }}>
                          {index + 1}
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                    <Box sx={ownClasses.poiPinBadge(false)}>
                      <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700 }}>
                        {index + 1}
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* POI Content */}
                <Box sx={ownClasses.poiContent}>
                  {poi.title && (
                    <Typography variant="h6" sx={ownClasses.poiTitle}>
                      {poi.title}
                    </Typography>
                  )}
                  {/* Live field value takes precedence; falls back to the author-provided label. */}
                  {(() => {
                    const featureData = featureDataRef.current.get(index);
                    const displayValue = featureData?.fieldValue ?? (poi.target.value !== undefined ? String(poi.target.value) : undefined);
                    if (!displayValue && !featureData?.iconDataUrl) return null;
                    return (
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                        {featureData?.iconDataUrl && (
                          <Box component="img" src={featureData.iconDataUrl} alt="" sx={ownClasses.poiStyleIcon} />
                        )}
                        {displayValue && (
                          <Typography variant="subtitle1" sx={ownClasses.poiFieldValue}>
                            {displayValue}
                          </Typography>
                        )}
                      </Stack>
                    );
                  })()}
                  {poi.text && (
                    <Typography variant="body2" color="text.secondary" sx={ownClasses.poiText}>
                      {poi.text}
                    </Typography>
                  )}
                </Box>
              </Paper>
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
};
