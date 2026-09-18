import React from 'react';
import { Stack as MuiStack, type StackProps as MuiStackProps } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';

interface StackProps extends MuiStackProps {
  gap?: number | string;
  alignItems?: React.CSSProperties['alignItems'];
  justifyContent?: React.CSSProperties['justifyContent'];
}

/** MUI 9 dropped gap/alignItems/justifyContent as Stack's own top-level props (sx-only now) -
 * this restores that shorthand so call sites throughout the editor don't all need `sx={{...}}`. */
export const Stack: React.FC<StackProps> = ({ gap, alignItems, justifyContent, sx, ...rest }) => (
  <MuiStack
    sx={[{ gap, alignItems, justifyContent } as SxProps<Theme>, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}
    {...rest}
  />
);
