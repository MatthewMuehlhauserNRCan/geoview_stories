export const getSxClasses = () => ({
  title: {
    fontWeight: 600,
  },
  // Flexbox (not grid) so a partial last row centers instead of hugging the left edge.
  list: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 3,
  },
  card: {
    flex: '1 1 260px',
    maxWidth: 320,
    borderRadius: 2,
    overflow: 'hidden',
    backgroundColor: 'background.paper',
  },
  cardActionArea: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    height: '100%',
    '&:hover .doormat-title-bar': { backgroundColor: 'primary.dark' },
  },
  cardTitleBar: {
    backgroundColor: 'primary.main',
    color: 'primary.contrastText',
    px: 2,
    py: 1.5,
    fontWeight: 600,
    transition: 'background-color 0.2s ease',
  },
  cardBody: {
    p: 2,
    flexGrow: 1,
    // text.secondary doesn't guarantee AA contrast against arbitrary theme backgrounds; text.primary does.
    color: 'text.primary',
  },
});
