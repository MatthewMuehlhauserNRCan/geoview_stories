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
import { getSxClasses } from './TableOfContents-styles';

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
  const classes = getSxClasses();
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
        <IconButton onClick={handleToggle} sx={classes.menuButton} aria-label="Open table of contents">
          <MenuIcon />
        </IconButton>
      )}

      {/* Mobile menu button */}
      {!isDesktop && (
        <IconButton onClick={handleToggle} sx={classes.menuButton} aria-label="Toggle table of contents">
          <MenuIcon />
        </IconButton>
      )}

      {/* Table of Contents Drawer - Persistent on desktop, temporary on mobile */}
      <Drawer
        variant={isDesktop ? 'permanent' : 'temporary'}
        anchor="left"
        open={isOpen}
        onClose={() => setMobileOpen(false)}
        sx={classes.drawer(drawerWidth)}
      >
        <Box sx={classes.drawerBody}>
          {/* Collapse button inside TOC */}
          {!collapsed && isDesktop && (
            <Box sx={classes.collapseRow}>
              <IconButton
                onClick={handleToggle}
                size="small"
                aria-label="Collapse table of contents"
              >
                <ChevronLeftIcon />
              </IconButton>
            </Box>
          )}
          
          <Typography variant="h6" sx={classes.heading}>
            Chapters
          </Typography>
          <List>
            {items.map((item) => (
              <ListItemButton
                key={item.slideIndex}
                selected={activeIndex === item.slideIndex}
                onClick={() => handleItemClick(item)}
                sx={classes.listItem}
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
