import type { Theme } from '@mui/material/styles';

export const getSxClasses = (theme: Theme) => ({
  wrapper: { mx: { xs: -2, md: 0 } },
  paper: { overflow: 'hidden', borderRadius: { xs: 0, md: 2 } },
  title: { p: 2 },
  titleText: { fontWeight: 600 },
  videoBody: { position: 'relative' },
  youtubeFrame: (height: number | string) => ({
    width: '100%',
    height,
    border: 'none',
    borderRadius: 1,
  }),
  localVideo: (width: string | number) => ({
    width,
    maxWidth: '100%',
    height: 'auto',
    borderRadius: 1,
  }),
  transcript: { p: 2, backgroundColor: 'grey.100' },
});
