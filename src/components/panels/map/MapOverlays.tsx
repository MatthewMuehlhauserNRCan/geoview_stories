import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { getSxClasses } from './map-shared-style';

export const MapLoadingOverlay: React.FC<{ message: string }> = ({ message }) => {
  const classes = getSxClasses();
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
  const classes = getSxClasses();
  return (
    <Box sx={[classes.overlay, classes.scrollGuardOverlay]}>
      <Box sx={classes.scrollGuardMessage}>
        <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>
          Use Ctrl + scroll to zoom the map
        </Typography>
      </Box>
    </Box>
  );
};
