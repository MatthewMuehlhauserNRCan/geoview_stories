import React from 'react';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';

interface HeaderProps {
  title: string;
  logo?: {
    src: string;
    altText: string;
  };
}

export const Header: React.FC<HeaderProps> = ({ title, logo }) => {
  return (
    <AppBar
      position="sticky"
      id="story-header"
      sx={{
        backgroundColor: 'background.paper',
        color: 'text.primary',
        borderBottom: '1px solid',
        borderColor: 'divider',
        boxShadow: 1,
      }}
    >
      <Toolbar>
        {logo && (
          <Box sx={{ mr: 2 }}>
            <img src={logo.src} alt={logo.altText} style={{ height: 40 }} />
          </Box>
        )}
        <Typography variant="h6" component="h1" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
      </Toolbar>
    </AppBar>
  );
};
