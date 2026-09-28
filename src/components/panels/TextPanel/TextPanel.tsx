import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import { TextPanel as TextPanelType } from '@/types/StoryConfig';
import { runInteraction } from '@/core/interactions/runInteraction';
import { getSxClasses } from './TextPanel-style';

const INTERACTION_LINK_PREFIX = '#interaction:';

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
        {!fileError && content && (
          <ReactMarkdown
            components={{
              // A link href of `#interaction:<id>` triggers a configured Interaction (see
              // StoryConfig.interactions) instead of navigating - lets story text link directly
              // to the same map actions a ButtonGroupPanel button can trigger.
              a: ({ href, children, ...rest }) =>
                href?.startsWith(INTERACTION_LINK_PREFIX) ? (
                  <a
                    href={href}
                    {...rest}
                    onClick={(e) => {
                      e.preventDefault();
                      runInteraction(href.slice(INTERACTION_LINK_PREFIX.length)).catch((err) =>
                        console.error('[TextPanel] Interaction failed:', err)
                      );
                    }}
                  >
                    {children}
                  </a>
                ) : (
                  <a href={href} {...rest}>
                    {children}
                  </a>
                ),
            }}
          >
            {content}
          </ReactMarkdown>
        )}
      </Box>
    </Paper>
  );
};
