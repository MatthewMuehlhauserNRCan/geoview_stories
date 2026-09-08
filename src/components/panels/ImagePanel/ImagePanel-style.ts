import type { Theme } from '@mui/material/styles';

export const getSxClasses = (theme: Theme) => ({
  wrapper: { mx: { xs: -2, md: 0 } },
  paper: { overflow: 'hidden', borderRadius: { xs: 0, md: 2 } },
  title: { p: 2 },
  titleText: { fontWeight: 600 },
  image: { width: '100%', height: 'auto', display: 'block' },
  caption: { p: 2, backgroundColor: 'grey.100' },
});
