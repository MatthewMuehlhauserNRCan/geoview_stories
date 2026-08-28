import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';

interface QuotePanelProps {
  quote: string;
  author?: string;
  role?: string;
  organization?: string;
}

export const QuotePanel: React.FC<QuotePanelProps> = ({ quote, author, role, organization }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        backgroundColor: 'primary.light',
        borderLeft: '4px solid',
        borderColor: 'primary.main',
        borderRadius: 2,
        position: 'relative',
      }}
    >
      <FormatQuoteIcon
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
          fontSize: 48,
          color: 'primary.main',
          opacity: 0.3,
        }}
      />
      <Box sx={{ pl: 6 }}>
        <Typography
          variant="h6"
          component="blockquote"
          sx={{
            fontStyle: 'italic',
            mb: 2,
            lineHeight: 1.6,
            color: 'text.primary',
          }}
        >
          "{quote}"
        </Typography>
        {(author || role || organization) && (
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            {author && (
              <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                — {author}
              </Typography>
            )}
            {role && (
              <Typography variant="body2" color="text.secondary">
                {role}
              </Typography>
            )}
            {organization && (
              <Typography variant="body2" color="text.secondary">
                {organization}
              </Typography>
            )}
          </Box>
        )}
      </Box>
    </Paper>
  );
};
