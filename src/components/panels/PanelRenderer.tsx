import React from 'react';
import { Panel, QuotePanelConfig } from '@/types/StoryConfig';
import { TextPanel } from './TextPanel/TextPanel';
import { ImagePanel } from './ImagePanel/ImagePanel';
import { MapPanel } from './map/MapPanel';
import { VideoPanel } from './VideoPanel/VideoPanel';
import { InteractiveMapPanel } from './map/InteractiveMapPanel';
import { QuotePanel } from './QuotePanel/QuotePanel';
import { SlideshowPanel } from './SlideshowPanel/SlideshowPanel';
import { Box, Typography } from '@mui/material';
import { getSxClasses } from './PanelRenderer-style';

interface PanelRendererProps {
  panel: Panel;
  panelInstanceId?: string;
}

export const PanelRenderer: React.FC<PanelRendererProps> = ({ panel, panelInstanceId }) => {
  const classes = getSxClasses();

  switch (panel.type) {
    case 'text':
      return <TextPanel panel={panel} />;
    case 'image':
      return <ImagePanel panel={panel} />;
    case 'map':
      return <MapPanel panel={panel} panelInstanceId={panelInstanceId} />;
    case 'interactive-map':
      return <InteractiveMapPanel panel={panel} panelInstanceId={panelInstanceId} />;
    case 'video':
      return <VideoPanel panel={panel} />;
    case 'quote':
      return <QuotePanel {...(panel as QuotePanelConfig)} />;
    case 'slideshow':
      return <SlideshowPanel panel={panel} />;
    case 'dynamic':
      // TODO: Implement DynamicPanel
      return (
        <Box sx={classes.placeholder}>
          <Typography>Dynamic Panel (Coming Soon)</Typography>
        </Box>
      );
    default:
      return (
        <Box sx={classes.errorPlaceholder}>
          <Typography>Unknown panel type</Typography>
        </Box>
      );
  }
};
