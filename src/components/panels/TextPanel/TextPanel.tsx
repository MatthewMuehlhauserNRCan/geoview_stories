import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import { TextPanel as TextPanelType } from '@/types/StoryConfig';
import { getSxClasses } from './TextPanel-style';

interface TextPanelProps {
  panel: TextPanelType;
}

export const TextPanel: React.FC<TextPanelProps> = ({ panel }) => {
  const classes = getSxClasses();
  return (
    <Paper elevation={0} sx={classes.paper} className={panel.cssClasses}>
      {panel.title && (
        <Typography variant="h4" component="h2" gutterBottom sx={classes.title}>
          {panel.title}
        </Typography>
      )}
      <Box sx={classes.content}>
        <ReactMarkdown>{panel.content}</ReactMarkdown>
      </Box>
    </Paper>
  );
};
