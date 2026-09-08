import React from 'react';
import { Box, Typography, Paper, useTheme } from '@mui/material';
import { ImagePanel as ImagePanelType } from '@/types/StoryConfig';
import { getSxClasses } from './ImagePanel-style';

interface ImagePanelProps {
  panel: ImagePanelType;
}

export const ImagePanel: React.FC<ImagePanelProps> = ({ panel }) => {
  const classes = getSxClasses(useTheme());
  return (
    <Box sx={classes.wrapper}>
      <Paper elevation={0} sx={classes.paper}>
        {panel.title && (
          <Box sx={classes.title}>
            <Typography variant="h5" component="h3" sx={classes.titleText}>
              {panel.title}
            </Typography>
          </Box>
        )}
        <Box
          component="img"
          src={panel.src}
          alt={panel.altText || panel.title || 'Image'}
          sx={classes.image}
        />
        {panel.caption && (
          <Box sx={classes.caption}>
            <Typography variant="body2" color="text.secondary">
              {panel.caption}
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};
