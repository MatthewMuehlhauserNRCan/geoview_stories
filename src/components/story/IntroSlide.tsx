import React from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { IntroSlide as IntroSlideType } from '@/types/StoryConfig';

interface IntroSlideProps {
  intro: IntroSlideType;
  onEnter: () => void;
}

export const IntroSlide: React.FC<IntroSlideProps> = ({ intro, onEnter }) => {
  return (
    <Box
      sx={{
        minHeight: '50vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: 'primary.main',
      }}
    >
      {intro.backgroundImage && (
        <Box
          component="img"
          src={intro.backgroundImage}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            zIndex: 0,
          }}
        />
      )}
      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
        {intro.logo && (
          <Box sx={{ mb: 4 }}>
            <img
              src={intro.logo.src}
              alt={intro.logo.altText}
              style={{ maxHeight: 120, maxWidth: '100%' }}
            />
          </Box>
        )}
        <Typography
          variant="h2"
          component="h1"
          sx={{
            color: 'white',
            fontWeight: 700,
            mb: 2,
          }}
        >
          {intro.title}
        </Typography>
        {intro.subtitle && (
          <Typography
            variant="h5"
            sx={{
              color: 'white',
              mb: 4,
            }}
          >
            {intro.subtitle}
          </Typography>
        )}
        <Button
          variant="contained"
          size="large"
          onClick={onEnter}
          endIcon={<ArrowDownwardIcon />}
          sx={{
            px: 4,
            py: 1.5,
            fontSize: '1.1rem',
          }}
        >
          Begin Story
        </Button>
      </Container>
    </Box>
  );
};
