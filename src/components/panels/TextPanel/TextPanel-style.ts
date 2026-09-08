import type { Theme } from '@mui/material/styles';

export const getSxClasses = (theme: Theme) => ({
  paper: {
    p: 4,
    backgroundColor: 'background.paper',
    borderRadius: 2,
  },
  title: {
    fontWeight: 600,
  },
  content: {
    '& p': { mb: 2, lineHeight: 1.7 },
    '& h1, & h2, & h3': { mt: 3, mb: 2, fontWeight: 600 },
    '& ul, & ol': { pl: 3, mb: 2 },
    '& a': { color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } },
    '& img': { maxWidth: '100%', height: 'auto', borderRadius: 1 },
  },
});
