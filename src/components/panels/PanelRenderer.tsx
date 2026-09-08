import React from 'react';
import { Panel, QuotePanelConfig } from '@/types/StoryConfig';
import { TextPanel } from './TextPanel';
import { ImagePanel } from './ImagePanel';
import { MapPanel } from './MapPanel';
import { VideoPanel } from './VideoPanel';
import { InteractiveMapPanel } from './InteractiveMapPanel';
import { QuotePanel } from './QuotePanel';
import { Box, Typography } from '@mui/material';

interface PanelRendererProps {
  panel: Panel;
  panelInstanceId?: string;
}

export const PanelRenderer: React.FC<PanelRendererProps> = ({ panel, panelInstanceId }) => {
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
      // TODO: Implement SlideshowPanel
      return (
        <Box sx={{ p: 4, backgroundColor: 'info.light', borderRadius: 2 }}>
          <Typography>Slideshow Panel (Coming Soon)</Typography>
        </Box>
      );
    case 'dynamic':
      // TODO: Implement DynamicPanel
      return (
        <Box sx={{ p: 4, backgroundColor: 'info.light', borderRadius: 2 }}>
          <Typography>Dynamic Panel (Coming Soon)</Typography>
        </Box>
      );
    default:
      return (
        <Box sx={{ p: 4, backgroundColor: 'error.light', borderRadius: 2 }}>
          <Typography>Unknown panel type</Typography>
        </Box>
      );
  }
};
