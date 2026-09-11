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
  listItem: {
    borderRadius: 1,
    mb: 0.5,
    '&.Mui-selected': {
      backgroundColor: 'primary.main',
      color: 'primary.contrastText',
      '&:hover': { backgroundColor: 'primary.dark' },
    },
  },
});
