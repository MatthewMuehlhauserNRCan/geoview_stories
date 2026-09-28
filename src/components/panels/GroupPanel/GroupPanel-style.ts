export const getSxClasses = () => ({
  // Vertical stack of a group's own rows - same rhythm as Slide's `rows`, but with no
  // slide-level pacing/min-height since a group is nested inside another panel/row, not a
  // full page section of its own.
  rows: { display: 'flex', flexDirection: 'column', gap: 6, width: '100%' },
  row: (flexDirection: { xs: string; md: string } | string) => ({
    display: 'flex',
    flexDirection,
    gap: 4,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  }),
});
