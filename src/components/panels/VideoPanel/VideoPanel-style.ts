export const getSxClasses = () => ({
  wrapper: { 
    mx: { xs: -2, md: 0 },
    width: '100%',
  },
  paper: { overflow: 'hidden', borderRadius: { xs: 0, md: 2 } },
  title: { p: 2 },
  titleText: { fontWeight: 600 },
  videoBody: { position: 'relative' },
  // 16:9 by default so the iframe scales with the column's actual width instead of a fixed pixel
  // height stretching/squishing it once paired with a media column that isn't a fixed size (e.g.
  // next to text). `height`, when set, only caps how tall it's allowed to get on very wide columns.
  embedFrame: (height?: number) => ({
    width: '100%',
    aspectRatio: '16 / 9',
    ...(height ? { maxHeight: height } : {}),
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
