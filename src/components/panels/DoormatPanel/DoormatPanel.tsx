import React from 'react';
import { Box, Card, CardActionArea, Typography } from '@mui/material';
import { DoormatPanel as DoormatPanelType } from '@/types/StoryConfig';
import { getSxClasses } from './DoormatPanel-style';

interface DoormatPanelProps {
  panel: DoormatPanelType;
}

export const DoormatPanel: React.FC<DoormatPanelProps> = ({ panel }) => {
  const classes = getSxClasses();
  return (
    <Box>
      <Box sx={classes.list}>
        {panel.items.map((item, index) => {
          const external = item.external ?? true;
          return (
            <Card key={index} elevation={0} sx={classes.card}>
              <CardActionArea
                component="a"
                href={item.href}
                target={external ? '_blank' : undefined}
                rel={external ? 'noopener noreferrer' : undefined}
                sx={classes.cardActionArea}
              >
                <Typography component="span" className="doormat-title-bar" sx={classes.cardTitleBar}>
                  {item.title}
                </Typography>
                {item.description && (
                  <Typography variant="body2" sx={classes.cardBody}>
                    {item.description}
                  </Typography>
                )}
              </CardActionArea>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
};
