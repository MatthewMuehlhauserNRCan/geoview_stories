import React from 'react';
import { Box, Typography, Paper, useTheme } from '@mui/material';
import { VideoPanel as VideoPanelType } from '@/types/StoryConfig';
import { getSxClasses } from './VideoPanel-style';

interface VideoPanelProps {
  panel: VideoPanelType;
}

export const VideoPanel: React.FC<VideoPanelProps> = ({ panel }) => {
  const classes = getSxClasses(useTheme());

  const renderVideo = () => {
    if (panel.videoType === 'YouTube') {
      return (
        <Box
          component="iframe"
          src={panel.src}
          sx={classes.youtubeFrame(panel.height || 500)}
          title={panel.title || 'Video'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    }

    // Local or external video
    return (
      <Box component="video" controls autoPlay={panel.autoplay} sx={classes.localVideo(panel.width || '100%')}>
        <source src={panel.src} type="video/mp4" />
        {panel.caption && <track kind="captions" src={panel.caption} label="English" />}
        Your browser does not support the video tag.
      </Box>
    );
  };

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
        <Box sx={classes.videoBody}>{renderVideo()}</Box>
        {panel.transcript && (
          <Box sx={classes.transcript}>
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
