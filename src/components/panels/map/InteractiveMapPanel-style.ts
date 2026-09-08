import type { Theme } from '@mui/material/styles';

export const getSxClasses = (theme: Theme) => ({
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
  },
  poiCard: (isActive: boolean) => ({
    overflow: 'hidden',
    border: '2px solid',
    borderColor: isActive ? 'primary.main' : 'transparent',
    borderRadius: 2,
    backgroundColor: 'background.paper',
    transition: 'all 0.3s ease',
    transform: isActive ? 'scale(1.02)' : 'scale(1)',
    minHeight: { xs: 'auto', md: '400px' }, // Auto height on mobile, tall cards on desktop
  }),
  poiImageWrapper: {
    position: 'relative',
    width: '100%',
    paddingTop: '56.25%', // 16:9 aspect ratio
    overflow: 'hidden',
    backgroundColor: 'grey.200',
  },
  poiImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  poiPinBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    backgroundColor: 'white',
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
  },
  poiTitle: {
    fontWeight: 600,
    mb: 1,
    color: 'text.primary',
  },
  poiFieldValue: {
    fontWeight: 500,
    mb: 1,
    color: 'primary.main',
  },
  poiText: {
    mb: 2,
    lineHeight: 1.6,
  },
  poiChips: {
    flexWrap: 'wrap',
  },
});
