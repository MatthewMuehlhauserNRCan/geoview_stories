import React, { useEffect, useState } from 'react';
import { Box, IconButton, Modal } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
import { getSxClasses } from './poi-style';

interface PoiImageLightboxProps {
  images: string[];
  open: boolean;
  onClose: () => void;
}

/** Prev/next/close lightbox for a POI card's photo gallery (same modal pattern as SlideshowPanel's fullscreen view). */
export const PoiImageLightbox: React.FC<PoiImageLightboxProps> = ({ images, open, onClose }) => {
  const classes = getSxClasses();
  const [index, setIndex] = useState(0);
  const count = images.length;

  // Always reopen at the first photo
  useEffect(() => {
    if (open) setIndex(0);
  }, [open]);

  const goPrev = () => setIndex((i) => (i - 1 + count) % count);
  const goNext = () => setIndex((i) => (i + 1) % count);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goPrev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      goNext();
    }
  };

  if (count === 0) return null;

  return (
    <Modal open={open} onClose={onClose} sx={classes.lightboxModal}>
      <Box sx={classes.lightboxBackdrop} onClick={onClose} onKeyDown={handleKeyDown} tabIndex={-1}>
        <IconButton onClick={onClose} sx={classes.lightboxCloseButton} aria-label="Close photo gallery">
          <CloseIcon />
        </IconButton>

        <Box component="img" src={images[index]} alt="" sx={classes.lightboxImage} onClick={(e) => e.stopPropagation()} />

        {count > 1 && (
          <>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              sx={classes.lightboxNavButton('left')}
              aria-label="Previous photo"
            >
              <ChevronLeftIcon fontSize="large" />
            </IconButton>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              sx={classes.lightboxNavButton('right')}
              aria-label="Next photo"
            >
              <ChevronRightIcon fontSize="large" />
            </IconButton>
            <Box sx={classes.lightboxCounter}>
              {index + 1} / {count}
            </Box>
          </>
        )}
      </Box>
    </Modal>
  );
};
