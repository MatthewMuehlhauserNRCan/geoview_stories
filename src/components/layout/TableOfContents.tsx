import React from 'react';
import {
  Drawer,
  List,
  ListItem,
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

interface TocEntryProps {
  item: TocItem;
  depth: number;
  activeIndex: number;
  onLocalClick: (slideIndex: number) => void;
}

/** Renders one TOC entry (local, external, or a non-clickable group label) plus its sublist, recursively. */
const TocEntry: React.FC<TocEntryProps> = ({ item, depth, activeIndex, onLocalClick }) => {
  const classes = getSxClasses();
  const isExternal = item.href !== undefined;
  // A group label - no slideIndex to scroll to and no href to navigate to - is just
  // heading text for its sublist, not a real action, so it shouldn't look clickable.
  const isGroupLabel = !isExternal && item.slideIndex === undefined;

  return (
    <>
      {isExternal ? (
        <ListItemButton component="a" href={item.href} sx={classes.externalItem(depth)}>
          <ListItemText
            primary={item.title || 'Untitled'}
            slotProps={{ primary: { style: { fontSize: 14, fontWeight: 600 } } }}
          />
          <OpenInNewIcon fontSize="small" sx={classes.externalIcon} />
        </ListItemButton>
      ) : isGroupLabel ? (
        <ListItem sx={classes.groupLabel(depth)}>
          <ListItemText
            primary={item.title || 'Untitled'}
            slotProps={{ primary: { style: { fontSize: 14, fontWeight: 600 } } }}
          />
        </ListItem>
      ) : (
        <ListItemButton
          selected={activeIndex === item.slideIndex}
          onClick={() => onLocalClick(item.slideIndex!)}
          sx={classes.listItem(depth)}
        >
          <ListItemText
            primary={item.title || 'Untitled'}
            slotProps={{
              primary: {
                style: { fontSize: 14, fontWeight: activeIndex === item.slideIndex ? 600 : 400 },
              },
            }}
          />
        </ListItemButton>
      )}

      {item.sublist && (
        <List disablePadding>
          {item.sublist.map((child, index) => (
            <TocEntry
              key={child.href ?? child.slideIndex ?? index}
              item={child}
              depth={depth + 1}
              activeIndex={activeIndex}
              onLocalClick={onLocalClick}
            />
          ))}
        </List>
      )}
    </>
  );
};

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
            {items.map((item, index) => (
              <TocEntry
                key={item.href ?? item.slideIndex ?? index}
                item={item}
                depth={0}
                activeIndex={activeIndex}
                onLocalClick={handleLocalItemClick}
              />
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
};
