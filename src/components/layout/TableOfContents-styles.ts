export const getSxClasses = () => ({
  menuButton: {
    position: 'fixed',
    top: 16,
    left: 16,
    zIndex: 1300,
    backgroundColor: 'background.paper',
    boxShadow: 2,
    '&:hover': { backgroundColor: 'action.hover' },
  },
  drawer: (drawerWidth: number) => ({
    width: drawerWidth,
    flexShrink: 0,
    transition: 'width 0.3s',
    '& .MuiDrawer-paper': {
      width: drawerWidth,
      boxSizing: 'border-box',
      top: 0,
      height: '100%',
      borderRight: '1px solid',
      borderColor: 'divider',
      transition: 'width 0.3s',
      overflowX: 'hidden',
    },
  }),
  drawerBody: { overflow: 'auto', p: 2, pt: 1 },
  collapseRow: { display: 'flex', justifyContent: 'flex-end', mb: 1 },
  heading: { mb: 2, fontWeight: 600, color: 'primary.main' },
  listItem: (depth: number = 0) => ({
    borderRadius: 1,
    mb: 0.5,
    ...(depth > 0 && { pl: 2 + depth * 1.5 }),
    '&.Mui-selected': {
      backgroundColor: 'primary.main',
      color: 'primary.contrastText',
      '&:hover': { backgroundColor: 'primary.dark' },
    },
  }),
  groupLabel: (depth: number = 0) => ({
    mb: 0.5,
    color: 'text.secondary',
    ...(depth > 0 && { pl: 2 + depth * 1.5 }),
  }),
  // Same look as groupLabel (muted, never "active") since it's a different kind of
  // entry - a navigation escape hatch, not a slide in this page - just still clickable.
  externalItem: (depth: number = 0) => ({
    mb: 0.5,
    color: 'text.secondary',
    ...(depth > 0 && { pl: 2 + depth * 1.5 }),
  }),
  externalIcon: {
    ml: 1,
    color: 'text.secondary',
    flexShrink: 0,
  },
});
