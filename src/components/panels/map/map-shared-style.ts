/** Shared classes so MapPanel, ManualPoiMapPanel, and AutoPoiMapPanel look consistent with each other */
export const getSxClasses = () => ({
  paper: {
    // Split by axis (not `overflow: 'hidden'`) so the map's rounded corners still clip
    // horizontally, but GeoView's footer bar - which grows taller in normal document flow when a
    // tab (e.g. "Layers") is expanded, rather than overlaying the map - is reachable via scroll
    // instead of being invisibly cut off by a fixed-height card.
    overflowX: 'hidden',
    overflowY: 'auto',
    borderRadius: { xs: 0, md: 2 },
    // Explicit border so separation from the page doesn't rely on elevation shadow alone.
    border: '1px solid',
    borderColor: 'divider',
  },
  container: {
    width: '100%',
    backgroundColor: 'grey.200',
  },
  titleBar: {
    p: 2,
    borderBottom: '1px solid',
    borderColor: 'divider',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  loadingOverlay: {
    backgroundColor: 'background.paper',
    zIndex: 1000,
  },
  scrollGuardOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1001,
    transition: 'opacity 0.2s',
  },
  scrollGuardMessage: {
    backgroundColor: 'background.paper',
    px: 3,
    py: 2,
    borderRadius: 2,
    boxShadow: 3,
  },
});
