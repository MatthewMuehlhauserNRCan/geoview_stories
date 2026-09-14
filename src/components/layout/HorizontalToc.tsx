import React, { useState } from 'react';
import { Box, Button, Menu, MenuItem } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { TocItem } from '@/types/StoryConfig';
import { getSxClasses } from './HorizontalToc-style';

interface HorizontalTocProps {
  items: TocItem[];
  slideIds: string[];
  activeIndex: number;
  onItemClick: (slideId: string) => void;
}

interface EntryProps {
  item: TocItem;
  slideIds: string[];
  activeIndex: number;
  onItemClick: (slideId: string) => void;
}

/**
 * One top-level entry: a plain scroll/link button, or (if it has a sublist) a button that opens
 * a dropdown. Only one level of dropdown is supported here - unlike the vertical TOC's fully
 * recursive sublist, a slim horizontal bar has nowhere to put a flyout-within-a-flyout, so a
 * grandchild's own sublist is simply not rendered.
 */
const HorizontalTocEntry: React.FC<EntryProps> = ({ item, slideIds, activeIndex, onItemClick }) => {
  const classes = getSxClasses();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isExternal = item.href !== undefined;
  const hasDropdown = !!item.sublist && item.sublist.length > 0;

  if (isExternal) {
    return (
      <Button component="a" href={item.href} sx={classes.navButton(false)}>
        <Box component="span" sx={classes.externalLabel}>
          {item.title || 'Untitled'}
        </Box>
        <OpenInNewIcon fontSize="small" sx={{ ml: 0.5, flexShrink: 0 }} />
      </Button>
    );
  }

  if (hasDropdown) {
    const isChildActive = item.sublist!.some((child) => child.slideIndex === activeIndex);
    return (
      <>
        <Button
          onClick={(e) => setAnchorEl(e.currentTarget)}
          aria-haspopup="true"
          aria-expanded={!!anchorEl}
          sx={classes.navButton(isChildActive)}
        >
          <Box component="span" sx={classes.navLabel}>
            {item.title || 'Untitled'}
          </Box>
          <ExpandMoreIcon fontSize="small" sx={{ ml: 0.5, flexShrink: 0 }} />
        </Button>
        <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
          {item.sublist!.map((child, index) => {
            if (child.href !== undefined) {
              return (
                <MenuItem key={child.href} component="a" href={child.href} onClick={() => setAnchorEl(null)}>
                  {child.title || 'Untitled'}
                  <OpenInNewIcon fontSize="small" sx={{ ml: 1 }} />
                </MenuItem>
              );
            }
            if (child.slideIndex === undefined) {
              // A group label (or anything with its own sublist) can't go any deeper here.
              return (
                <MenuItem key={index} disabled>
                  {child.title || 'Untitled'}
                </MenuItem>
              );
            }
            return (
              <MenuItem
                key={child.slideIndex}
                selected={activeIndex === child.slideIndex}
                onClick={() => {
                  setAnchorEl(null);
                  onItemClick(slideIds[child.slideIndex!]);
                }}
              >
                {child.title || 'Untitled'}
              </MenuItem>
            );
          })}
        </Menu>
      </>
    );
  }

  if (item.slideIndex === undefined) {
    // A bare group label with no sublist has nothing to do in a slim top bar.
    return null;
  }

  return (
    <Button onClick={() => onItemClick(slideIds[item.slideIndex!])} sx={classes.navButton(activeIndex === item.slideIndex)}>
      <Box component="span" sx={classes.navLabel}>
        {item.title || 'Untitled'}
      </Box>
    </Button>
  );
};

/** Slim, sticky, single-row alternative to the vertical TOC Drawer. Desktop-only - the caller
 * falls back to the vertical TableOfContents (with its own mobile hamburger) below that width. */
export const HorizontalToc: React.FC<HorizontalTocProps> = ({ items, slideIds, activeIndex, onItemClick }) => {
  const classes = getSxClasses();
  return (
    <Box component="nav" sx={classes.bar} aria-label="Table of contents">
      {items.map((item, index) => (
        <HorizontalTocEntry
          key={item.href ?? item.slideIndex ?? index}
          item={item}
          slideIds={slideIds}
          activeIndex={activeIndex}
          onItemClick={onItemClick}
        />
      ))}
    </Box>
  );
};
