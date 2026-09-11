import React, { useState } from 'react';
import { Box, Typography, Paper, Modal, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { ImagePanel as ImagePanelType } from '@/types/StoryConfig';
import { getSxClasses } from './ImagePanel-style';

interface ImagePanelProps {
  panel: ImagePanelType;
}

export const ImagePanel: React.FC<ImagePanelProps> = ({ panel }) => {
  const classes = getSxClasses();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  // Opt-out rather than opt-in: full screen on click is the expected behavior
  // for a story image unless a panel explicitly disables it.
  const fullscreenEnabled = panel.fullscreen !== false;
  const altText = panel.altText || panel.title || 'Image';

  const openLightbox = () => setLightboxOpen(true);
  const closeLightbox = () => setLightboxOpen(false);

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
          alt={altText}
          sx={[classes.image, fullscreenEnabled && classes.imageClickable]}
          onClick={fullscreenEnabled ? openLightbox : undefined}
          role={fullscreenEnabled ? 'button' : undefined}
          tabIndex={fullscreenEnabled ? 0 : undefined}
          aria-label={fullscreenEnabled ? `View "${altText}" full screen` : undefined}
          onKeyDown={
            fullscreenEnabled
              ? (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openLightbox();
                  }
                }
              : undefined
          }
        />
        {panel.caption && (
          <Box sx={classes.caption}>
            <Typography variant="body2" color="text.secondary">
              {panel.caption}
            </Typography>
          </Box>
        )}
      </Paper>
      {fullscreenEnabled && (
        <Modal open={lightboxOpen} onClose={closeLightbox} sx={classes.lightboxModal}>
          <Box sx={classes.lightboxBackdrop} onClick={closeLightbox}>
            <IconButton onClick={closeLightbox} sx={classes.lightboxCloseButton} aria-label="Close full screen image">
              <CloseIcon />
            </IconButton>
            <Box
              component="img"
              src={panel.src}
              alt={altText}
              sx={classes.lightboxImage}
              onClick={(e) => e.stopPropagation()}
            />
          </Box>
        </Modal>
      )}
    </Box>
  );
};

