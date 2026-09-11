export const getSxClasses = () => ({
  wrapper: { mx: { xs: -2, md: 0 }, width: '100%' },
  paper: { overflow: 'hidden', borderRadius: { xs: 0, md: 2 } },
  title: { p: 2 },
  titleText: { fontWeight: 600 },
  // maxWidth/maxHeight (not width/height) so a tall image scales down
  // proportionally instead of being cropped or distorted.
  image: { display: 'block', maxWidth: '100%', maxHeight: { md: '70vh' }, width: 'auto', height: 'auto', mx: 'auto' },
  imageClickable: { cursor: 'zoom-in' },
  caption: { p: 2, backgroundColor: 'grey.100' },
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
