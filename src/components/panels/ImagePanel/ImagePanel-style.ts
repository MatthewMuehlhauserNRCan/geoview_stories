export const getSxClasses = () => ({
  // Full-bleed on mobile (cancels the slide's own horizontal padding); the figure itself
  // shrink-wraps to the image's rendered width (see `figure` below), so it's centered here
  // whenever that's narrower than the column - text-align rather than mx:'auto' since the
  // figure is an inline-level box.
  wrapper: { mx: { xs: -2, md: 0 }, width: '100%', textAlign: 'center' },
  // `inline-flex` + column so this shrink-wraps to the image's own rendered width, instead of
  // stretching across the whole (possibly much wider) column - that's what lets the caption
  // below line up exactly under the photo instead of sitting in an oversized box around it.
  figure: {
    display: 'inline-flex',
    flexDirection: 'column',
    maxWidth: '100%',
    m: 0,
    overflow: 'hidden',
    borderRadius: { xs: 0, md: 2 },
  },
  // maxWidth/maxHeight (not width/height) so a tall image scales down
  // proportionally instead of being cropped or distorted.
  image: { display: 'block', maxWidth: '100%', maxHeight: { md: '70vh' }, width: 'auto', height: 'auto' },
  imageClickable: { cursor: 'zoom-in' },
  // Sits flush under the image (same rendered width, no gap) with a hairline divider so it
  // reads as one attached unit rather than a separate floating label.
  caption: {
    px: 2,
    py: 1,
    backgroundColor: 'grey.100',
    borderTop: '1px solid',
    borderColor: 'divider',
    textAlign: 'center',
    fontStyle: 'italic',
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
    cursor: 'default',
  },
});
