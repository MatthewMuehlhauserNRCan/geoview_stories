import React from 'react';
import { Box, Container, Typography, Button, useTheme } from '@mui/material';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { IntroSlide as IntroSlideType } from '@/types/StoryConfig';
import { getSxClasses } from './story-styles';

interface IntroSlideProps {
  intro: IntroSlideType;
  onEnter: () => void;
}

export const IntroSlide: React.FC<IntroSlideProps> = ({ intro, onEnter }) => {
  const classes = getSxClasses(useTheme()).introSlide;
  return (
    <Box sx={classes.root}>
      {intro.backgroundImage && (
        <Box component="img" src={intro.backgroundImage} sx={classes.backgroundImage} />
      )}
      <Container maxWidth="md" sx={classes.container}>
        {intro.logo && (
          <Box sx={classes.logoWrapper}>
            <Box component="img" src={intro.logo.src} alt={intro.logo.altText} sx={classes.logo} />
          </Box>
        )}
        <Typography variant="h2" component="h1" sx={classes.title}>
          {intro.title}
        </Typography>
        {intro.subtitle && (
          <Typography variant="h5" sx={classes.subtitle}>
            {intro.subtitle}
          </Typography>
        )}
        <Button variant="contained" size="large" onClick={onEnter} endIcon={<ArrowDownwardIcon />} sx={classes.enterButton}>
          Begin Story
        </Button>
      </Container>
    </Box>
  );
};
