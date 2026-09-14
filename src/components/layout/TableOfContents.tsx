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
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { TocItem } from '@/types/StoryConfig';
import { getSxClasses } from './TableOfContents-styles';

interface TableOfContentsProps {
  items: TocItem[];
  // Index-aligned with the story's slides; resolves a TocItem.slideIndex to its actual scroll/DOM
  // target id, since a TOC entry's display title may now differ from the slide's own title.
  slideIds: string[];
  heading?: string;
  activeIndex: number;
  onItemClick: (slideId: string) => void;
  orientation?: 'vertical' | 'horizontal';
  collapsed?: boolean;
  onToggle?: () => void;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({
  items,
  slideIds,
  heading = 'Chapters',
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

  const handleLocalItemClick = (slideIndex: number) => {
    onItemClick(slideIds[slideIndex]);
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
            {heading}
          </Typography>
          <List>
            {items.map((item, index) => {
              const isExternal = item.href !== undefined;
              return (
                <React.Fragment key={item.href ?? item.slideIndex ?? index}>
                  {isExternal ? (
                    <ListItemButton component="a" href={item.href} sx={classes.listItem}>
                      <ListItemText
                        primary={item.title || 'Untitled'}
                        slotProps={{ primary: { style: { fontSize: 14 } } }}
                      />
                      <OpenInNewIcon fontSize="small" sx={classes.externalIcon} />
                    </ListItemButton>
                  ) : (
                    <ListItemButton
                      selected={activeIndex === item.slideIndex}
                      onClick={() => handleLocalItemClick(item.slideIndex!)}
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
                  )}

                  {item.sublist && (
                    <List disablePadding>
                      {item.sublist.map((subItem) => (
                        <ListItemButton
                          key={subItem.slideIndex}
                          selected={activeIndex === subItem.slideIndex}
                          onClick={() => handleLocalItemClick(subItem.slideIndex)}
                          sx={classes.sublistItem}
                        >
                          <ListItemText
                            primary={subItem.title || 'Untitled'}
                            slotProps={{
                              primary: {
                                style: {
                                  fontSize: 13,
                                  fontWeight: activeIndex === subItem.slideIndex ? 600 : 400,
                                },
                              },
                            }}
                          />
                        </ListItemButton>
                      ))}
                    </List>
                  )}
                </React.Fragment>
              );
            })}
          </List>
        </Box>
      </Drawer>
    </>
  );
};
