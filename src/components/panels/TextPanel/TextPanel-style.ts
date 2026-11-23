export const getSxClasses = () => ({
  paper: {
    p: 4,
    backgroundColor: 'background.paper',
    borderRadius: 2,
  },
  content: {
    '& p': { mb: 2, lineHeight: 1.7 },
    '& h1, & h2, & h3': { mt: 3, mb: 2, fontWeight: 600 },
    '& ul, & ol': { pl: 3, mb: 2 },
    '& a': { color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } },
    '& img': { maxWidth: '100%', height: 'auto', borderRadius: 1 },
    '& blockquote p:before': {
      content: '"“"',
      display: 'inline',
      fontSize: '1.22rem',
      fontStyle: 'italic',
    },
    '& blockquote p:after': {
      content: '"”"',
      display: 'inline',
      fontSize: '1.2rem',
      fontStyle: 'italic',
    },
    '& blockquote p': {
      fontSize: '1.2rem',
      fontStyle: 'italic',
    },
    // Classes applied by remarkStyleDirective.ts to `style` directives (e.g. `:style[text]{.accent}`
    // or a `:::style{.lead}` block) - the only inline/block styling a story's markdown can request,
    // so colours and sizes stay theme-aware and contrast-checked instead of ad hoc per-story values.
    '& .md-lead': { fontSize: '1.25rem', lineHeight: 1.6 },
    '& .md-small': { fontSize: '0.875rem' },
    '& .md-accent': { color: 'primary.main' },
    '& .md-muted': { color: 'text.secondary' },
    '& .md-highlight': { backgroundColor: 'warning.light', color: 'warning.contrastText', px: 0.5, borderRadius: 0.5 },
  },
});
