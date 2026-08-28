import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, Paper, Chip, Stack, CircularProgress } from '@mui/material';
import { InteractiveMapPanel as InteractiveMapPanelType } from '@/types/StoryConfig';
import '@/types/GeoView'; // Import GeoView global types

// Extend Window interface to track cgpv init state globally (shared with MapPanel)
declare global {
  interface Window {
    _cgpvInitCalled?: boolean;
  }
}

interface InteractiveMapPanelProps {
  panel: InteractiveMapPanelType;
}

export const InteractiveMapPanel: React.FC<InteractiveMapPanelProps> = ({ panel }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const poiRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activePoiIndex, setActivePoiIndex] = useState<number | null>(null);
  const [showScrollGuard, setShowScrollGuard] = useState(false);
  const mapId = useRef(`interactive-map-${Math.random().toString(36).substr(2, 9)}`);
  const mapInstanceRef = useRef<any>(null);
  const initializingRef = useRef(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const featureDataRef = useRef<Map<number, { extent: [number, number, number, number]; fieldValue?: string }>>(new Map());
  const scrollGuardTimeoutRef = useRef<number | null>(null);

  // Initialize GeoView map
  useEffect(() => {
    const initMap = async () => {
      try {        
        // Check if already initializing (prevents React strict mode double-init)
        if (initializingRef.current) {
          return;
        }

        // Check if cgpv is available
        if (!window.cgpv) {
          console.error('⚠️ GeoView (cgpv) not loaded. Waiting...');
          setTimeout(initMap, 500);
          return;
        }

        // Check if this component already initialized (DOM element has ID attribute)
        if (mapContainerRef.current?.hasAttribute('id')) {
          try {
            const mapViewer = window.cgpv?.api?.getMapViewer(mapId.current);
            if (mapViewer) {
              mapInstanceRef.current = mapViewer;
            }
          } catch (err) {
            // Map doesn't exist yet
          }
          setLoading(false);
          return;
        }

        // Check if map already exists in GeoView API
        try {
          const mapViewer = window.cgpv?.api?.getMapViewer(mapId.current);
          if (mapViewer) {
            mapInstanceRef.current = mapViewer;
            setLoading(false);
            return;
          }
        } catch (err) {
          // Map doesn't exist yet, continue with initialization
        }

        // Mark as initializing
        initializingRef.current = true;

        // Determine config path - map 'default' to interactive-map.json
        const configPath = panel.config === 'default' || panel.config === '' 
          ? '/configs/interactive-map.json' 
          : panel.config;

        // Load config file
        const response = await fetch(configPath);
        if (!response.ok) {
          throw new Error(`Failed to load map config: HTTP ${response.status}`);
        }
        const mapConfig = await response.json();

        // Set the config as data attribute
        if (mapContainerRef.current) {
          mapContainerRef.current.setAttribute('id', mapId.current);
          mapContainerRef.current.setAttribute('data-config', JSON.stringify(mapConfig));
          mapContainerRef.current.setAttribute('data-lang', 'en');
          mapContainerRef.current.classList.add('geoview-map');
        }

        // Register handler for when THIS specific map is ready
        unsubscribeRef.current = window.cgpv.onMapReady((mapViewer) => {
          if (mapViewer.mapId === mapId.current) {
            mapInstanceRef.current = mapViewer;
            mapContainerRef.current?.classList.add('geoview-loaded');
            
            // Fetch feature data for all POIs
            fetchFeatureData();
            
            setLoading(false);
          }
        });

        // Initialize GeoView - call for each map, GeoView will process new containers
        try {
          window.cgpv.init();
        } catch (err) {
          console.error('❌ Error calling cgpv.init():', err);
          setError('Failed to initialize GeoView');
          setLoading(false);
        }
      } catch (err) {
        console.error('Error initializing interactive map:', err);
        setError('Failed to initialize interactive map');
        setLoading(false);
        initializingRef.current = false;
      }
    };

    initMap();

    return () => {
      // Unsubscribe from onMapReady event
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      
      // Reset initializing flag
      initializingRef.current = false;
      
      // Properly destroy the map viewer if it was created
      try {
        if (window.cgpv?.api?.getMapViewer(mapId.current)) {
          window.cgpv.api.deleteMapViewer?.(mapId.current, false);
        }
      } catch (err) {
        // Map doesn't exist or already deleted
      }
    };
  }, [panel.config]);

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
          if (index !== -1 && index !== activePoiIndex) {
            setActivePoiIndex(index);
            zoomToPoiOnMap(index);
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
  }, [loading, panel.points, activePoiIndex]);

  // Scroll guard to prevent accidental zooming
  useEffect(() => {
    if (!panel.scrollguard || !mapContainerRef.current) return;

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
      if (scrollGuardTimeoutRef.current) {
        window.clearTimeout(scrollGuardTimeoutRef.current);
      }
      
      // Hide overlay after 1.5 seconds
      scrollGuardTimeoutRef.current = window.setTimeout(() => {
        setShowScrollGuard(false);
      }, 1500);
    };

    const mapElement = mapContainerRef.current;
    // Use capture phase to intercept before GeoView's handlers
    mapElement.addEventListener('wheel', handleWheel, { passive: false, capture: true });

    return () => {
      mapElement.removeEventListener('wheel', handleWheel, { capture: true });
      if (scrollGuardTimeoutRef.current) {
        window.clearTimeout(scrollGuardTimeoutRef.current);
      }
    };
  }, [panel.scrollguard]);

  const fetchFeatureData = async () => {
    if (!mapInstanceRef.current) return;

    try {
      const mapViewer = window.cgpv.api.getMapViewer(mapId.current);
      if (!mapViewer) return;

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
            });
          }
        } catch (err) {
          console.error(`Error fetching feature data for POI ${i}:`, err);
        }
      }
    } catch (err) {
      console.error('Error in fetchFeatureData:', err);
    }
  };

  const zoomToPoiOnMap = (index: number) => {
    const poi = panel.points[index];
    
    if (!mapInstanceRef.current) {
      console.warn('Map instance not ready');
      return;
    }

    try {
      const mapViewer = window.cgpv.api.getMapViewer(mapId.current);
      if (!mapViewer) {
        console.warn('Map viewer not found');
        return;
      }

      if (poi.target.returnHome) {
        // Return to home extent
        mapViewer.controllers.mapController.zoomToInitialExtent();
      } else {
        // Check if we have cached feature data
        const featureData = featureDataRef.current.get(index);
        if (featureData?.extent) {
          // Zoom to the feature's extent
          const fitOptions = {
            padding: [100, 100, 100, 100] as [number, number, number, number],
            maxZoom: 10,
            duration: 500,
          };
          mapViewer.controllers.mapController.zoomToExtent(featureData.extent, true, fitOptions);
        } else {
          console.warn('No feature data available for POI', index);
        }
      }
    } catch (err) {
      console.error('Error zooming to POI:', err);
    }
  };

  if (error) {
    return (
      <Paper
        elevation={2}
        sx={{
          overflow: 'hidden',
          borderRadius: 2,
          backgroundColor: 'error.light',
        }}
      >
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="error">
            {error}
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: { xs: 0, md: 3 }, // No gap on mobile for full-width map
        minHeight: '600px',
        mx: { xs: -2, md: 0 }, // Negative margin on mobile to break out of parent padding
      }}
    >
      {/* Map Container - Sticky on mobile and desktop */}
      <Box
        sx={{
          flex: { xs: '0 0 auto', md: '2' },
          width: { xs: '100%', md: 'auto' }, // Full width on mobile
          minWidth: 0,
          position: 'sticky',
          top: { xs: 64, md: 80 }, // Stick below header on both mobile and desktop
          alignSelf: 'flex-start',
          height: { xs: '40vh', md: 'calc(100vh - 100px)' }, // 40% viewport height on mobile, full height on desktop
          maxHeight: { md: '800px' },
          zIndex: 10, // Ensure map stays above content when sticky
        }}
      >
        <Paper
          elevation={2}
          sx={{
            overflow: 'hidden',
            borderRadius: { xs: 0, md: 2 }, // No border radius on mobile for flush edge
            height: '100%',
            position: 'relative',
          }}
        >
          {panel.title && (
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h5" component="h3" sx={{ fontWeight: 600 }}>
                {panel.title}
              </Typography>
            </Box>
          )}
          <Box sx={{ position: 'relative', height: panel.title ? 'calc(100% - 65px)' : '100%' }}>
            <Box
              ref={mapContainerRef}
              sx={{
                width: '100%',
                height: '100%',
                backgroundColor: 'grey.200',
              }}
            />
            {loading && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  zIndex: 1000,
                  pointerEvents: 'none',
                }}
              >
                <Box sx={{ textAlign: 'center' }}>
                  <CircularProgress />
                  <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                    Loading interactive map...
                  </Typography>
                </Box>
              </Box>
            )}
            {/* Scroll guard overlay */}
            {showScrollGuard && panel.scrollguard && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  zIndex: 1002,
                  pointerEvents: 'none',
                  transition: 'opacity 0.2s',
                }}
              >
                <Box
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    px: 3,
                    py: 2,
                    borderRadius: 2,
                    boxShadow: 3,
                  }}
                >
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    Use Ctrl + scroll to zoom the map
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </Paper>
      </Box>

      {/* Points of Interest List - Scrollable */}
      {(() => {
        return null;
      })()}
      {panel.points && panel.points.length > 0 && (
        <Box
          sx={{
            flex: '1',
            minWidth: 0,
            mt: { xs: 3, md: 0 }, // Add top margin on mobile for spacing from map
            px: { xs: 2, md: 0 }, // Add padding back on mobile for POI content
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, px: 1 }}>
            Scroll through locations
          </Typography>
          <Stack spacing={30} sx={{ pt: { xs: 3, md: 30 }, pb: 30 }}> {/* Less top padding on mobile since map is sticky above */}
            {panel.points.map((poi, index) => (
              <Paper
                key={index}
                ref={(el) => {
                  poiRefs.current[index] = el;
                }}
                elevation={activePoiIndex === index ? 4 : 1}
                sx={{
                  overflow: 'hidden',
                  border: '2px solid',
                  borderColor: activePoiIndex === index ? 'primary.main' : 'transparent',
                  borderRadius: 2,
                  backgroundColor: 'background.paper',
                  transition: 'all 0.3s ease',
                  transform: activePoiIndex === index ? 'scale(1.02)' : 'scale(1)',
                  minHeight: { xs: 'auto', md: '400px' }, // Auto height on mobile, tall cards on desktop
                }}
              >
                {/* POI Image */}
                {poi.image && (
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      paddingTop: '56.25%', // 16:9 aspect ratio
                      overflow: 'hidden',
                      backgroundColor: 'grey.200',
                    }}
                  >
                    <Box
                      component="img"
                      src={poi.image}
                      alt={poi.altText || poi.title}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                    {/* Location Pin Icon Overlay */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 16,
                        left: 16,
                        width: 40,
                        height: 40,
                        backgroundColor: 'white',
                        border: '2px solid',
                        borderColor: 'primary.main',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: 2,
                      }}
                    >
                      <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700 }}>
                        {index + 1}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {/* POI Content */}
                <Box sx={{ p: 3 }}>
                  {poi.title && (
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        mb: 1,
                        color: 'text.primary',
                      }}
                    >
                      {poi.title}
                    </Typography>
                  )}
                  {/* Show field value if available */}
                  {(() => {
                    const featureData = featureDataRef.current.get(index);
                    if (featureData?.fieldValue) {
                      return (
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 500,
                            mb: 1,
                            color: 'primary.main',
                          }}
                        >
                          {featureData.fieldValue}
                        </Typography>
                      );
                    }
                    return null;
                  })()}
                  {poi.text && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                      {poi.text}
                    </Typography>
                  )}
                  {poi.target && (
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                      {poi.target.layerId && (
                        <Chip
                          label={`Layer: ${poi.target.layerId}`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      )}
                      {poi.target.scale && (
                        <Chip
                          label={`Scale: 1:${poi.target.scale.toLocaleString()}`}
                          size="small"
                          color="secondary"
                          variant="outlined"
                        />
                      )}
                      {poi.target.value !== undefined && (
                        <Chip
                          label={`Feature ID: ${poi.target.value}`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Stack>
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
