import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import { TextPanel as TextPanelType } from '@/types/StoryConfig';
import { getSxClasses } from './TextPanel-style';

interface TextPanelProps {
  panel: TextPanelType;
}

export const TextPanel: React.FC<TextPanelProps> = ({ panel }) => {
  const classes = getSxClasses();
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  /**
   * Fetches the content of the text panel from an external file if `panel.contentFile` is specified.
   */
  useEffect(() => {
    if (!panel.contentFile) return;
    let cancelled = false;
    setFileContent(null);
    setFileError(null);

    fetch(panel.contentFile)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load ${panel.contentFile}: ${res.statusText}`);
        return res.text();
      })
      .then((text) => {
        if (!cancelled) setFileContent(text);
      })
      .catch((err) => {
        if (!cancelled) setFileError(err instanceof Error ? err.message : String(err));
      });

    return () => {
      cancelled = true;
    };
  }, [panel.contentFile]);

  const content = panel.contentFile ? fileContent : panel.content;

  return (
    <Paper elevation={0} sx={classes.paper}>
      <Box sx={classes.content}>
        {fileError && (
          <Typography color="error" variant="body2">
            {fileError}
          </Typography>
        )}
        {!fileError && content && <ReactMarkdown>{content}</ReactMarkdown>}
      </Box>
    </Paper>
  );
};
