import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { StoryViewer } from './components/story/StoryViewer';
import './styles/panels.css';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
    h2: {
      fontSize: '3rem',
      '@media (max-width:600px)': {
        fontSize: '2rem',
      },
    },
    h4: {
      fontSize: '2rem',
      '@media (max-width:600px)': {
        fontSize: '1.5rem',
      },
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          scrollBehavior: 'smooth',
        },
        body: {
          scrollbarWidth: 'thin',
          scrollbarColor: '#888 #f1f1f1',
          '&::-webkit-scrollbar': {
            width: '10px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#888',
            borderRadius: '5px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#555',
          },
        },
      },
    },
  },
});

interface StoryInstance {
  container: HTMLElement;
  root: ReturnType<typeof createRoot>;
  configPath: string;
}

const instances = new Map<string, StoryInstance>();

/**
 * Initialize a story viewer in the specified container
 * @param containerId - ID of the container element
 * @param configPath - Path to the story configuration JSON file
 */
function init(containerId: string, configPath: string): void {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`GeoView Story: Container element with id "${containerId}" not found`);
    return;
  }

  // Check if already initialized
  if (instances.has(containerId)) {
    console.warn(`GeoView Story: Container "${containerId}" is already initialized`);
    return;
  }

  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <StoryViewer configPath={configPath} />
      </ThemeProvider>
    </React.StrictMode>
  );

  instances.set(containerId, { container, root, configPath });
}

/**
 * Destroy a story viewer instance
 * @param containerId - ID of the container element
 */
function destroy(containerId: string): void {
  const instance = instances.get(containerId);
  if (!instance) {
    console.warn(`GeoView Story: No instance found for container "${containerId}"`);
    return;
  }

  instance.root.unmount();
  instances.delete(containerId);
}

/**
 * Auto-initialize all elements with class "geoview-story"
 */
function autoInit(): void {
  const elements = document.querySelectorAll<HTMLElement>('.geoview-story');
  elements.forEach((element) => {
    const configPath = element.getAttribute('data-config');
    const id = element.id || `geoview-story-${Math.random().toString(36).substring(7)}`;
    
    if (!element.id) {
      element.id = id;
    }

    if (!configPath) {
      console.error(`GeoView Story: Element with id "${id}" is missing data-config attribute`);
      return;
    }

    init(id, configPath);
  });
}

// Auto-initialize on DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', autoInit);
} else {
  // DOM already loaded
  autoInit();
}

// Export public API
const api = { init, destroy, autoInit };
export default api;

// Also expose on window for non-module usage
declare global {
  interface Window {
    geoviewStory: {
      init: typeof init;
      destroy: typeof destroy;
      autoInit: typeof autoInit;
    };
  }
}

if (typeof window !== 'undefined') {
  window.geoviewStory = api;
}
