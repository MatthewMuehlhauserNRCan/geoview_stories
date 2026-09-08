import type { Theme } from '@mui/material/styles';

export const getSxClasses = (theme: Theme) => ({
  placeholder: { p: 4, backgroundColor: 'info.light', borderRadius: 2 },
  errorPlaceholder: { p: 4, backgroundColor: 'error.light', borderRadius: 2 },
});
