import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { ImagePanel as ImagePanelType } from '@/types/StoryConfig';

interface ImagePanelProps {
  panel: ImagePanelType;
}

export const ImagePanel: React.FC<ImagePanelProps> = ({ panel }) => {
  return (
    <Box sx={{ mx: { xs: -2, md: 0 } }}>
      <Paper
        elevation={0}
        sx={{
          overflow: 'hidden',
          borderRadius: { xs: 0, md: 2 },
        }}
      >
      {panel.title && (
        <Box sx={{ p: 2 }}>
          <Typography variant="h5" component="h3" sx={{ fontWeight: 600 }}>
            {panel.title}
          </Typography>
        </Box>
      )}
      <Box
        component="img"
        src={panel.src}
        alt={panel.altText || panel.title || 'Image'}
        sx={{
          width: '100%',
          height: 'auto',
          display: 'block',
        }}
      />
      {panel.caption && (
        <Box sx={{ p: 2, backgroundColor: 'grey.100' }}>
          <Typography variant="body2" color="text.secondary">
            {panel.caption}
          </Typography>
        </Box>
      )}
    </Paper>
    </Box>
  );
};
