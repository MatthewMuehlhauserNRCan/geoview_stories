import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import { getSxClasses } from './QuotePanel-style';

interface QuotePanelProps {
  quote: string;
  author?: string;
  role?: string;
  organization?: string;
}

export const QuotePanel: React.FC<QuotePanelProps> = ({ quote, author, role, organization }) => {
  const classes = getSxClasses();
  return (
    <Paper elevation={0} sx={classes.paper}>
      <FormatQuoteIcon sx={classes.quoteIcon} />
      <Box sx={classes.body}>
        <Typography variant="h6" component="blockquote" sx={classes.quoteText}>
          "{quote}"
        </Typography>
        {(author || role || organization) && (
          <Box sx={classes.attribution}>
            {author && (
              <Typography variant="body1" sx={classes.author}>
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
