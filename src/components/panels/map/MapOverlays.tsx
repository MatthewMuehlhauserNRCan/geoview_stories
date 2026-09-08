import React from 'react';
import { Box, Typography, CircularProgress, useTheme } from '@mui/material';
import { getSxClasses } from './map-shared-style';

export const MapLoadingOverlay: React.FC<{ message: string }> = ({ message }) => {
  const classes = getSxClasses(useTheme());
  return (
    <Box sx={[classes.overlay, classes.loadingOverlay]}>
      <Box sx={{ textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          {message}
        </Typography>
      </Box>
    </Box>
  );
};

export const MapScrollGuardOverlay: React.FC = () => {
  const classes = getSxClasses(useTheme());
  return (
    <Box sx={[classes.overlay, classes.scrollGuardOverlay]}>
      <Box sx={classes.scrollGuardMessage}>
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
          Use Ctrl + scroll to zoom the map
        </Typography>
      </Box>
    </Box>
  );
};
