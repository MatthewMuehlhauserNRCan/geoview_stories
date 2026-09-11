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
    height: { xs: '40vh', md: 'calc(100vh - 100px)' }, // 40% viewport height on mobile, full height on desktop
    maxHeight: { md: '800px' },
    zIndex: 10, // Ensure map stays above content when sticky
  },
  mapPaper: {
    height: '100%',
    position: 'relative',
  },
  mapBody: (hasTitle: boolean) => ({
    position: 'relative',
    height: hasTitle ? 'calc(100% - 65px)' : '100%',
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
  poiImage: {
    width: 96,
    height: 96,
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid',
    borderColor: 'divider',
  },
  // Overlaps the bottom-right of the photo when one is present, otherwise stands alone
  poiPinBadge: (hasImage: boolean) => ({
    position: hasImage ? 'absolute' : 'static',
    ...(hasImage && { bottom: 0, right: 0 }),
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
  }),
  poiContent: {
    p: 3,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  poiTitle: {
    fontWeight: 600,
    mb: 1,
    color: 'text.primary',
  },
  poiFieldValue: {
    fontWeight: 500,
    color: 'primary.main',
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
});
