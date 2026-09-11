export const getSxClasses = () => ({
  paper: {
    p: 4,
    position: 'relative',
  },
  quoteIcon: {
    position: 'absolute',
    top: 16,
    left: 16,
    fontSize: 48,
    color: 'primary.main',
    opacity: 0.3,
  },
  body: { pl: 6 },
  quoteText: {
    fontStyle: 'italic',
    mb: 2,
    lineHeight: 1.6,
    color: 'text.primary',
  },
  attribution: { mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' },
  author: { fontWeight: 600, color: 'text.primary' },
});
