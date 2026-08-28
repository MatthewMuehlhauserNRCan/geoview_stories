import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import { TextPanel as TextPanelType } from '@/types/StoryConfig';

interface TextPanelProps {
  panel: TextPanelType;
}

export const TextPanel: React.FC<TextPanelProps> = ({ panel }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        backgroundColor: 'background.paper',
        borderRadius: 2,
      }}
      className={panel.cssClasses}
    >
      {panel.title && (
        <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
          {panel.title}
        </Typography>
      )}
      <Box
        sx={{
          '& p': { mb: 2, lineHeight: 1.7 },
          '& h1, & h2, & h3': { mt: 3, mb: 2, fontWeight: 600 },
          '& ul, & ol': { pl: 3, mb: 2 },
          '& a': { color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } },
          '& img': { maxWidth: '100%', height: 'auto', borderRadius: 1 },
        }}
      >
        <ReactMarkdown>{panel.content}</ReactMarkdown>
      </Box>
    </Paper>
  );
};
