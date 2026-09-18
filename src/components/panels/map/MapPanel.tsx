import React from 'react';
import { Box, Typography, Paper, useTheme } from '@mui/material';
import { MapPanel as MapPanelType } from '@/types/StoryConfig';
import { useStoryConfig } from '@/core/stores/StoryStore';
import { MapLoadingOverlay, MapScrollGuardOverlay } from './MapOverlays';
import { getSxClasses as getSharedSxClasses } from './map-shared-style';
import { getSxClasses } from './MapPanel-style';
import { useMapLifecycle } from './hooks/useMapLifecycle';
import { buildMapId } from './mapId';
import '@/types/GeoView'; // Import GeoView global types

interface MapPanelProps {
  panel: MapPanelType;
  panelInstanceId?: string;
}

export const MapPanel: React.FC<MapPanelProps> = ({ panel, panelInstanceId }) => {
  const mapId = buildMapId('map', panelInstanceId, panel.config);
  const shared = getSharedSxClasses();
  const classes = getSxClasses();
  const geoviewTheme = useTheme().geoviewTheme;
  const lang = useStoryConfig()?.lang ?? 'en';
  const { error, loading, showScrollGuard } = useMapLifecycle(mapId, panel.scrollguard, geoviewTheme);

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
      <Paper elevation={2} sx={shared.paper}>
        <Box sx={{ position: 'relative' }}>
          <Box
            id={mapId}
            data-config-url={panel.config}
            data-lang={lang}
            className="geoview-map"
            sx={[shared.container, { minHeight: '600px' }]}
          />
          {loading && <MapLoadingOverlay message="Loading GeoView map..." />}
          {showScrollGuard && panel.scrollguard && <MapScrollGuardOverlay />}
        </Box>
      </Paper>
    </Box>
  );
};
