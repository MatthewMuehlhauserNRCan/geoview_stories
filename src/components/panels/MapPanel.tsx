import React, { useEffect, useRef } from 'react';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';
import { MapPanel as MapPanelType } from '@/types/StoryConfig';
import '@/types/GeoView'; // Import GeoView global types

// Extend Window interface to track cgpv init state globally
declare global {
  interface Window {
    _cgpvInitCalled?: boolean;
  }
}

interface MapPanelProps {
  panel: MapPanelType;
}

export const MapPanel: React.FC<MapPanelProps> = ({ panel }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [showScrollGuard, setShowScrollGuard] = React.useState(false);
  
  // Use stable ID based on config path - prevents duplicate map creation
  const mapId = useRef(`map-${panel.config.replace(/[^a-zA-Z0-9]/g, '-')}`);
  const initializingRef = useRef(false);
  const destroyingRef = useRef(false);
  const mountedRef = useRef(true);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const scrollGuardTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    
    const initMap = async () => {
      try {   
        // Check if already initializing (prevents React strict mode double-init)
        if (initializingRef.current || destroyingRef.current) {
          console.log('[Map] Already initializing or destroying, skipping...');
          return;
        }

        // Check if cgpv is available
        if (!window.cgpv) {
          console.warn('[Map] GeoView not loaded, waiting...');
          if (mountedRef.current) {
            setTimeout(initMap, 500);
          }
          return;
        }

        // CRITICAL: Check if map already exists in GeoView's internal registry
        // This prevents React Strict Mode from trying to initialize a map that's still being cleaned up
        const existingMapIds = window.cgpv.api.getMapViewerIds();
        if (existingMapIds.includes(mapId.current)) {
          console.log('[Map] Map still exists in GeoView registry (Strict Mode cleanup race), recovering...');
          try {
            const existingMapViewer = window.cgpv.api.getMapViewer(mapId.current);
            if (existingMapViewer) {
              // Map exists and is usable - just mark as loaded
              mapContainerRef.current?.classList.add('geoview-loaded');
              setLoading(false);
              return;
            }
          } catch (err) {
            // Couldn't get the map, it might be in a bad state
            console.log('[Map] Map exists but unusable, waiting for cleanup...');
            // Retry after a short delay to let cleanup finish
            if (mountedRef.current) {
              setTimeout(initMap, 100);
            }
            return;
          }
        }

        console.log('[Map] Map does not exist, creating new one');

        // CRITICAL: Check if container already has GeoView attributes
        // This means cleanup from previous mount hasn't finished yet
        if (mapContainerRef.current?.hasAttribute('id')) {
          const existingId = mapContainerRef.current.getAttribute('id');
          console.log('[Map] Container still has ID attribute:', existingId, '- cleanup incomplete, waiting...');
          // Wait for cleanup to finish removing attributes
          if (mountedRef.current) {
            setTimeout(initMap, 100);
          }
          return;
        }

        // Mark as initializing
        initializingRef.current = true;

        // Determine config path - map 'default' to default-map.json
        const configPath = panel.config === 'default' || panel.config === '' 
          ? 'configs/default-map.json' 
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
            mapContainerRef.current?.classList.add('geoview-loaded');
            setLoading(false);
          }
        });

        // Initialize GeoView - GeoView will process all new containers with IDs
        try {
          await window.cgpv.init();
        } catch (err: any) {
          // Handle "already exists" error from React Strict Mode race condition
          // This happens when async cleanup hasn't finished before remount
          if (err?.message?.includes('already exists') || err?.name === 'MapViewerAlreadyExistsError') {
            console.log('[Map] Init failed - map still in registry, waiting for cleanup to complete...');
            // Remove the attributes we just set
            if (mapContainerRef.current) {
              mapContainerRef.current.removeAttribute('id');
              mapContainerRef.current.removeAttribute('data-config');
              mapContainerRef.current.removeAttribute('data-lang');
              mapContainerRef.current.classList.remove('geoview-map');
            }
            // Retry after cleanup completes
            if (mountedRef.current) {
              setTimeout(initMap, 150);
            }
            return;
          }
          // Other errors
          throw err;
        }
      } catch (err) {
        console.error('Error initializing map:', err);
        setError('Failed to initialize map');
        setLoading(false);
        initializingRef.current = false;
      }
    };

    initMap();

    return () => {
      // Mark component as unmounted
      mountedRef.current = false;
      destroyingRef.current = true;
      
      // Unsubscribe from onMapReady event
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      
      // Reset initializing flag
      initializingRef.current = false;
      
      // CRITICAL: Remove ID from container so GeoView doesn't think it's already processed
      // This must happen synchronously before React Strict Mode remounts
      if (mapContainerRef.current) {
        mapContainerRef.current.removeAttribute('id');
        mapContainerRef.current.removeAttribute('data-config');
        mapContainerRef.current.removeAttribute('data-lang');
        mapContainerRef.current.classList.remove('geoview-map', 'geoview-loaded');
      }
      
      // Destroy the map asynchronously
      (async () => {
        try {
          const mapViewer = window.cgpv?.api?.getMapViewer(mapId.current);
          if (mapViewer && window.cgpv?.api?.deleteMapViewer) {
            console.log('[Map] Destroying map on unmount:', mapId.current);
            await window.cgpv.api.deleteMapViewer(mapId.current, true);
            console.log('[Map] Map destroyed successfully');
          }
        } catch (err) {
          console.log('[Map] Cleanup: map already destroyed or not found');
        } finally {
          destroyingRef.current = false;
        }
      })();
    };
  }, [panel.config]);

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

  if (error) {
    return (
      <Box sx={{ mx: { xs: -2, md: 0 } }}>
        <Paper
          elevation={2}
          sx={{
            overflow: 'hidden',
            borderRadius: { xs: 0, md: 2 },
            backgroundColor: 'error.light',
          }}
        >
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="error">
              {error}
            </Typography>
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ mx: { xs: -2, md: 0 } }}>
      <Paper
        elevation={2}
        sx={{
          overflow: 'hidden',
          borderRadius: { xs: 0, md: 2 },
          height: panel.title ? 'auto' : '600px',
        }}
      >
      {panel.title && (
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h5" component="h3" sx={{ fontWeight: 600 }}>
            {panel.title}
          </Typography>
        </Box>
      )}
      <Box sx={{ position: 'relative' }}>
        <Box
          ref={mapContainerRef}
          sx={{
            width: '100%',
            height: panel.title ? '500px' : '600px',
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
                Loading GeoView map...
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
              zIndex: 1001,
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
  );
};
