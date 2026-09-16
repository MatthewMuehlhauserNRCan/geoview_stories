export const getSxClasses = () => ({
  root: {
    display: 'flex',
    flexDirection: { xs: 'column', md: 'row' },
    gap: { xs: 0, md: 3 }, // No gap on mobile for full-width map
    minHeight: '600px',
    mx: { xs: -2, md: 0 }, // Negative margin on mobile to break out of parent padding
  },
  mapWrapper: {
    flex: { xs: '0 0 auto', md: '2' },
    width: { xs: '100%', md: 'auto' }, // Full width on mobile
    minWidth: 0,
    position: 'sticky',
    top: { xs: 64, md: 80 }, // Stick below header on both mobile and desktop
    alignSelf: 'flex-start',
    zIndex: 10, // Ensure map stays above content when sticky
    // No height here - sized by its content (Paper -> map div, which has the real height below).
    // A percentage-height chain (mapWrapper -> mapPaper -> mapBody -> map div) can't grow when
    // GeoView's footer bar expands (percentages need a definite ancestor height, and a fixed one
    // just clips/scrolls or overlaps the next slide instead of pushing it down in normal flow).
  },
  mapPaper: {
    position: 'relative',
  },
  // hasTitle no longer changes anything here (kept for call-site compatibility) - the map div
  // below carries its own real height, title bar or not.
  mapBody: (_hasTitle: boolean) => ({
    position: 'relative',
  }),
  // The map div's own real (non-percentage) target height - a floor, not a cap, so it can still
  // grow to fit an expanded GeoView footer bar. Subtracts the title bar's height when present so
  // the overall sticky card's resting size roughly matches the title-less case.
  mapViewMinHeight: (hasTitle: boolean) => ({
    minHeight: {
      xs: hasTitle ? 'calc(40vh - 65px)' : '40vh',
      md: hasTitle ? 'calc(100vh - 165px)' : 'calc(100vh - 100px)',
    },
  }),
  poiSection: {
    flex: '1',
    minWidth: 0,
    mt: { xs: 3, md: 0 }, // Add top margin on mobile for spacing from map
    px: { xs: 2, md: 0 }, // Add padding back on mobile for POI content
  },
  poiSectionHeading: {
    fontWeight: 600,
    mb: 3,
    px: 1,
  },
  poiStack: {
    pt: { xs: 3, md: 30 }, // Less top padding on mobile since map is sticky above
    pb: 30,
    // Gap is viewport-relative (not a fixed px value) so it stays proportional
    // to the IntersectionObserver's percentage-based rootMargin trigger band
    // below, regardless of screen size - otherwise a fixed gap can end up
    // smaller than the band on some viewports, letting two POIs both intersect
    // it at once (or a fast scroll skip a card's threshold crossing entirely).
    gap: { xs: '25vh', md: '35vh' },
  },
  poiCard: (isActive: boolean) => ({
    overflow: 'hidden',
    border: '2px solid',
    borderColor: isActive ? 'primary.main' : 'transparent',
    borderRadius: 2,
    backgroundColor: 'background.paper',
    transition: 'all 0.3s ease',
    transform: isActive ? 'scale(1.02)' : 'scale(1)',
    textAlign: 'center',
  }),
  poiIconWrapper: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    pt: 3,
  },
  // Standalone number badge - no longer overlaps a thumbnail, the photo is its own block below the title now
  poiPinBadge: {
    width: 40,
    height: 40,
    backgroundColor: 'background.paper',
    border: '2px solid',
    borderColor: 'primary.main',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 2,
  },
  poiContent: {
    p: 3,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  poiTitleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
    mb: 1,
  },
  poiTitle: {
    fontWeight: 600,
    color: 'text.primary',
  },
  poiFieldValue: {
    fontWeight: 500,
    color: 'primary.main',
    mb: 1,
  },
  // Fixed light backing (not theme-aware) since the swatch's own colors are
  // rendered by GeoView assuming a light legend background, regardless of app theme
  poiStyleIcon: {
    width: 20,
    height: 20,
    objectFit: 'contain',
    backgroundColor: 'common.white',
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: '50%',
    p: '2px',
    boxSizing: 'content-box',
  },
  poiText: {
    lineHeight: 1.6,
  },
  poiLink: {
    mt: 2,
  },
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
  // The photo is its own square block, clickable to open the lightbox regardless of photo count
  poiImageButton: {
    position: 'relative',
    display: 'block',
    width: '100%',
    maxWidth: 220,
    mx: 'auto',
    mb: 2,
    p: 0,
    border: 0,
    borderRadius: 2,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    cursor: 'pointer',
  },
  poiImage: {
    display: 'block',
    width: '100%',
    aspectRatio: '1 / 1',
    objectFit: 'cover',
  },
  // Small badge on the thumbnail hinting there are more photos to see
  poiGalleryBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    width: 28,
    height: 28,
    borderRadius: '50%',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    color: 'common.white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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
  lightboxNavButton: (side: 'left' | 'right') => ({
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    [side]: 8,
    color: 'common.white',
    backgroundColor: 'transparent',
    '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.4)' },
  }),
  lightboxCounter: {
    position: 'absolute',
    bottom: 16,
    left: '50%',
    transform: 'translateX(-50%)',
    color: 'common.white',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 1,
    px: 1.5,
    py: 0.5,
    fontSize: '0.875rem',
  },
});
