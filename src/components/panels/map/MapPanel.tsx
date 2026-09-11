import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, useTheme } from '@mui/material';
import { MapPanel as MapPanelType } from '@/types/StoryConfig';
import { useMapReady } from '@/hooks/useMapReady';
import { MapLoadingOverlay, MapScrollGuardOverlay } from './MapOverlays';
import { getSxClasses as getSharedSxClasses } from './map-shared-style';
import { getSxClasses } from './MapPanel-style';
import '@/types/GeoView'; // Import GeoView global types

interface MapPanelProps {
  panel: MapPanelType;
  panelInstanceId?: string;
}

export const MapPanel: React.FC<MapPanelProps> = ({ panel, panelInstanceId }) => {
  // No hyphens: GeoView's legacy keyboard-focus code derives the map ID by
  // splitting the shell element's DOM id on '-', so a hyphen here breaks it.
  const mapId = `map_${(panelInstanceId || 'panel').replace(/[^a-zA-Z0-9]/g, '_')}_${panel.config.replace(/[^a-zA-Z0-9]/g, '_')}`;
  const [error, setError] = useState<string | null>(null);
  const [showScrollGuard, setShowScrollGuard] = useState(false);
  const mapReady = useMapReady(mapId);
  const loading = !error && !mapReady;
  const shared = getSharedSxClasses();
  const classes = getSxClasses();
  const geoviewTheme = useTheme().geoviewTheme;

  // cgpv.onMapReady is a single global callback slot owned by StoryController;
  // this only checks that the library itself loaded.
  useEffect(() => {
    if (!window.cgpv) {
      setError('GeoView library not loaded');
    }
  }, []);

  // GeoView has no data-theme attribute of its own, so sync it to our story's
  // theme here instead of duplicating the map config just to flip dark/light.
  useEffect(() => {
    if (!mapReady) return;
    window.cgpv.api.getMapViewer(mapId)?.setTheme(geoviewTheme);
  }, [mapReady, geoviewTheme, mapId]);

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
      <Box sx={classes.wrapper}>
        <Paper elevation={2} sx={[shared.paper, { backgroundColor: 'error.light' }]}>
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
    <Box sx={classes.wrapper}>
      <Paper elevation={2} sx={[shared.paper, { height: panel.title ? 'auto' : '600px' }]}>
        {panel.title && (
          <Box sx={shared.titleBar}>
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
            sx={[shared.container, { height: panel.title ? '500px' : '600px' }]}
          />
          {loading && <MapLoadingOverlay message="Loading GeoView map..." />}
          {showScrollGuard && panel.scrollguard && <MapScrollGuardOverlay />}
        </Box>
      </Paper>
    </Box>
  );
};
