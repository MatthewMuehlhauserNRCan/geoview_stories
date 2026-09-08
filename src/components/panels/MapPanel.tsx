import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';
import { MapPanel as MapPanelType } from '@/types/StoryConfig';
import { useMapReady } from '@/hooks/useMapReady';
import '@/types/GeoView'; // Import GeoView global types

interface MapPanelProps {
  panel: MapPanelType;
  panelInstanceId?: string;
}

export const MapPanel: React.FC<MapPanelProps> = ({ panel, panelInstanceId }) => {
  const mapId = `map-${(panelInstanceId || 'panel').replace(/[^a-zA-Z0-9]/g, '-')}-${panel.config.replace(/[^a-zA-Z0-9]/g, '-')}`;
  const [error, setError] = useState<string | null>(null);
  const [showScrollGuard, setShowScrollGuard] = useState(false);
  const mapReady = useMapReady(mapId);
  const loading = !error && !mapReady;

  // cgpv.onMapReady is a single global callback slot owned by StoryController;
  // this only checks that the library itself loaded.
  useEffect(() => {
    if (!window.cgpv) {
      setError('GeoView library not loaded');
    }
  }, []);

  // Scroll guard to prevent accidental zooming
  useEffect(() => {
    if (!panel.scrollguard) return;

    const scrollGuardTimeoutRef = { current: null as number | null };

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

    const mapElement = document.getElementById(mapId);
    if (mapElement) {
      mapElement.addEventListener('wheel', handleWheel, { passive: false, capture: true });

      return () => {
        mapElement.removeEventListener('wheel', handleWheel, { capture: true });
        if (scrollGuardTimeoutRef.current) {
          window.clearTimeout(scrollGuardTimeoutRef.current);
        }
      };
    }
  }, [panel.scrollguard, mapId]);

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
          border: '1px solid grey',
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
            id={mapId}
            data-config-url={panel.config}
            data-lang="en"
            className="geoview-map"
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
