import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { VideoPanel as VideoPanelType } from '@/types/StoryConfig';
import { getSxClasses } from './VideoPanel-style';

const VIDEO_MIME_TYPES: Record<string, string> = {
  mp4: 'video/mp4',
  m4v: 'video/mp4',
  webm: 'video/webm',
  ogg: 'video/ogg',
  ogv: 'video/ogg',
  mov: 'video/quicktime',
};

/**
 * Used to get the correct MIME type for a video file based on its extension.
 * 
 * @param src The source URL of the video file.
 * @returns The MIME type corresponding to the video's file extension, or undefined if not recognized.
 */
const getVideoMimeType = (src: string): string | undefined => {
  const path = src.split(/[?#]/)[0];
  const ext = path.slice(path.lastIndexOf('.') + 1).toLowerCase();
  return VIDEO_MIME_TYPES[ext];
};

interface VideoPanelProps {
  panel: VideoPanelType;
}

export const VideoPanel: React.FC<VideoPanelProps> = ({ panel }) => {
  const classes = getSxClasses();

  const renderVideo = () => {
    // No platform-specific logic here - any iframe-embeddable URL (YouTube, Vimeo, etc.) works the same way.
    if (panel.videoType === 'embed') {
      return (
        <Box
          component="iframe"
          src={panel.src}
          sx={classes.embedFrame(panel.height || 500)}
          title={panel.title || 'Video'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    }

    // Local or external video
    return (
      <Box component="video" controls autoPlay={panel.autoplay} sx={classes.localVideo(panel.width || '100%')}>
        <source src={panel.src} type={getVideoMimeType(panel.src)} />
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
