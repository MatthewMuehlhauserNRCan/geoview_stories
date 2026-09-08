import type { Theme } from '@mui/material/styles';

/** Shared classes so MapPanel and InteractiveMapPanel look consistent with each other */
export const getSxClasses = (theme: Theme) => ({
  paper: {
    overflow: 'hidden',
    borderRadius: { xs: 0, md: 2 },
    // Explicit border so separation from the page doesn't rely on the elevation
    // shadow alone, which reads very differently for a sticky vs. in-flow panel.
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
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 1000,
  },
  scrollGuardOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1001,
    transition: 'opacity 0.2s',
  },
  scrollGuardMessage: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    px: 3,
    py: 2,
    borderRadius: 2,
    boxShadow: 3,
  },
});
