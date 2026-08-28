import React from 'react';
import { Box, Container, Link, Typography } from '@mui/material';

interface FooterProps {
  contextLink?: string;
  contextLabel?: string;
}

export const Footer: React.FC<FooterProps> = ({ contextLink, contextLabel }) => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="lg">
        {contextLink && contextLabel && (
          <Typography variant="body2" color="text.secondary" align="center">
            <Link href={contextLink} target="_blank" rel="noopener noreferrer" color="primary">
              {contextLabel}
            </Link>
          </Typography>
        )}
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
          © {new Date().getFullYear()} GeoView Stories
        </Typography>
      </Container>
    </Box>
  );
};
