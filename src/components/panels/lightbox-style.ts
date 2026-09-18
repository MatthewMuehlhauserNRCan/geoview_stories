/** Shared modal-lightbox classes, used by both PoiImageLightbox (POI photo gallery) and
 * SlideshowPanel's fullscreen view - same visual pattern, different content above it. */
export const getLightboxSxClasses = () => ({
  visuallyHidden: {
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: 0,
  },
  lightboxModal: { display: 'flex' },
  lightboxBackdrop: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    outline: 'none',
  },
  lightboxCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    color: 'common.white',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
  },
  lightboxImage: {
    display: 'block',
    maxWidth: '90vw',
    maxHeight: '90vh',
    width: 'auto',
    height: 'auto',
    objectFit: 'contain',
  },
});
