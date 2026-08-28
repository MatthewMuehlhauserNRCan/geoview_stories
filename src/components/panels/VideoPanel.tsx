import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { VideoPanel as VideoPanelType } from '@/types/StoryConfig';

interface VideoPanelProps {
  panel: VideoPanelType;
}

export const VideoPanel: React.FC<VideoPanelProps> = ({ panel }) => {
  const renderVideo = () => {
    if (panel.videoType === 'YouTube') {
      return (
        <Box
          component="iframe"
          src={panel.src}
          sx={{
            width: '100%',
            height: panel.height || 500,
            border: 'none',
            borderRadius: 1,
          }}
          title={panel.title || 'Video'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    }

    // Local or external video
    return (
      <Box
        component="video"
        controls
        autoPlay={panel.autoplay}
        sx={{
          width: panel.width || '100%',
          maxWidth: '100%',
          height: 'auto',
          borderRadius: 1,
        }}
      >
        <source src={panel.src} type="video/mp4" />
        {panel.caption && <track kind="captions" src={panel.caption} label="English" />}
        Your browser does not support the video tag.
      </Box>
    );
  };

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
      <Box sx={{ position: 'relative' }}>{renderVideo()}</Box>
      {panel.transcript && (
        <Box sx={{ p: 2, backgroundColor: 'grey.100' }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Transcript: </strong>
            <a href={panel.transcript} target="_blank" rel="noopener noreferrer">
              View transcript
            </a>
          </Typography>
        </Box>
      )}
    </Paper>
    </Box>
  );
};
