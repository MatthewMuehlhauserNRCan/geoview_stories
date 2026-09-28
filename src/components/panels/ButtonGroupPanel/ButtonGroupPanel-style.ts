export const getSxClasses = () => ({
  root: (direction: 'row' | 'column') => ({
    display: 'flex',
    flexDirection: direction,
    flexWrap: 'wrap',
    gap: 2,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  }),
});
