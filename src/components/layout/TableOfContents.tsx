import React from 'react';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  Box,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { TocItem } from '@/types/StoryConfig';

interface TableOfContentsProps {
  items: TocItem[];
  activeIndex: number;
  onItemClick: (slideId: string) => void;
  orientation?: 'vertical' | 'horizontal';
  collapsed?: boolean;
  onToggle?: () => void;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({
  items,
  activeIndex,
  onItemClick,
  orientation = 'vertical',
  collapsed = false,
  onToggle,
}) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Desktop: controlled by parent, Mobile: local state
  const isOpen = isDesktop ? !collapsed : mobileOpen;
  const drawerWidth = collapsed && isDesktop ? 0 : 280;

  const handleToggle = () => {
    if (isDesktop && onToggle) {
      onToggle();
    } else {
      setMobileOpen(!mobileOpen);
    }
  };

  const handleItemClick = (item: TocItem) => {
    const slideId = `${item.slideIndex}-${item.title.toLowerCase().replace(/\s+/g, '-')}`;
    onItemClick(slideId);
    if (!isDesktop) {
      setMobileOpen(false);
    }
  };

  return (
    <>
      {/* Menu button - shows when TOC is collapsed */}
      {collapsed && isDesktop && (
        <IconButton
          onClick={handleToggle}
          sx={{
            position: 'fixed',
            top: 80,
            left: 16,
            zIndex: 1300,
            backgroundColor: 'background.paper',
            boxShadow: 2,
            '&:hover': { backgroundColor: 'action.hover' },
          }}
          aria-label="Open table of contents"
        >
          <MenuIcon />
        </IconButton>
      )}

      {/* Mobile menu button */}
      {!isDesktop && (
        <IconButton
          onClick={handleToggle}
          sx={{
            position: 'fixed',
            top: 80,
            left: 16,
            zIndex: 1300,
            backgroundColor: 'background.paper',
            boxShadow: 2,
            '&:hover': { backgroundColor: 'action.hover' },
          }}
          aria-label="Toggle table of contents"
        >
          <MenuIcon />
        </IconButton>
      )}

      {/* Table of Contents Drawer - Persistent on desktop, temporary on mobile */}
      <Drawer
        variant={isDesktop ? 'permanent' : 'temporary'}
        anchor="left"
        open={isOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          transition: 'width 0.3s',
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            top: 64,
            height: 'calc(100% - 64px)',
            borderRight: '1px solid',
            borderColor: 'divider',
            transition: 'width 0.3s',
            overflowX: 'hidden',
          },
        }}
      >
        <Box sx={{ overflow: 'auto', p: 2, pt: 1 }}>
          {/* Collapse button inside TOC */}
          {!collapsed && isDesktop && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
              <IconButton
                onClick={handleToggle}
                size="small"
                aria-label="Collapse table of contents"
              >
                <ChevronLeftIcon />
              </IconButton>
            </Box>
          )}
          
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
            Chapters
          </Typography>
          <List>
            {items.map((item) => (
              <ListItemButton
                key={item.slideIndex}
                selected={activeIndex === item.slideIndex}
                onClick={() => handleItemClick(item)}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  },
                }}
              >
                <ListItemText
                  primary={item.title || 'Untitled'}
                  slotProps={{
                    primary: {
                      style: {
                        fontSize: 14,
                        fontWeight: activeIndex === item.slideIndex ? 600 : 400,
                      },
                    },
                  }}
                />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
};
