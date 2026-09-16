import React, { useState } from 'react';
import { Box, Button, Paper, Typography } from '@mui/material';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import { getSxClasses } from './poi-style';
import { PoiImageLightbox } from './PoiImageLightbox';

export interface PoiCardProps {
  index: number;
  title?: string;
  text?: string;
  images?: string[]; // First is the card thumbnail; a lightbox is always available to view it full-size
  altText?: string;
  fieldValue?: string;
  iconDataUrl?: string;
  linkUrl?: string;
  linkLabel?: string;
  isActive: boolean;
  cardRef: (el: HTMLDivElement | null) => void;
}

/** One scroll-triggered POI card - shared between ManualPoiMapPanel and AutoPoiMapPanel, which
 * only differ in how they build this normalized set of props, not in how a card is displayed. */
export const PoiCard: React.FC<PoiCardProps> = ({
  index,
  title,
  text,
  images,
  altText,
  fieldValue,
  iconDataUrl,
  linkUrl,
  linkLabel,
  isActive,
  cardRef,
}) => {
  const classes = getSxClasses();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const thumbnail = images?.[0];
  const hasGallery = (images?.length ?? 0) > 1;

  return (
    <Paper ref={cardRef} elevation={isActive ? 4 : 1} sx={classes.poiCard(isActive)}>
      <Box sx={classes.poiIconWrapper}>
        <Box sx={classes.poiPinBadge}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
            {index + 1}
          </Typography>
        </Box>
      </Box>

      <Box sx={classes.poiContent}>
        {(title || iconDataUrl) && (
          <Box sx={classes.poiTitleRow}>
            {iconDataUrl && <Box component="img" src={iconDataUrl} alt="" sx={classes.poiStyleIcon} />}
            {title && (
              <Typography variant="h6" sx={classes.poiTitle}>
                {title}
              </Typography>
            )}
          </Box>
        )}
        {fieldValue && (
          <Typography variant="subtitle1" sx={classes.poiFieldValue}>
            {fieldValue}
          </Typography>
        )}

        {thumbnail && (
          <Box
            component="button"
            type="button"
            onClick={() => setLightboxOpen(true)}
            sx={classes.poiImageButton}
            aria-label={hasGallery ? `View all ${images!.length} photos` : 'View photo full size'}
          >
            <Box component="img" src={thumbnail} alt={altText || title || ''} sx={classes.poiImage} />
            {hasGallery && (
              <Box sx={classes.poiGalleryBadge}>
                <PhotoLibraryIcon sx={{ fontSize: 16 }} />
              </Box>
            )}
          </Box>
        )}

        {text && (
          <Typography variant="body2" color="text.secondary" sx={classes.poiText}>
            {text}
          </Typography>
        )}
        {linkUrl && (
          <Button
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="outlined"
            size="small"
            sx={classes.poiLink}
          >
            {linkLabel || 'Learn more'}
            <Box component="span" sx={classes.visuallyHidden}>
              {' '}
              (opens in a new tab)
            </Box>
          </Button>
        )}
      </Box>

      {thumbnail && <PoiImageLightbox images={images!} open={lightboxOpen} onClose={() => setLightboxOpen(false)} />}
    </Paper>
  );
};


