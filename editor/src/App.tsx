import React, { useMemo, useState } from 'react';
import { Box, CssBaseline, Divider, Tab, Tabs, ThemeProvider, createTheme } from '@mui/material';
import { Toolbar } from './components/Toolbar';
import { SlideList } from './components/SlideList';
import { SlideEditor } from './components/SlideEditor';
import { TopLevelEditor } from './components/TopLevelEditor';
import { PreviewPane } from './components/PreviewPane';
import { useEditorState } from './state/useEditorState';
import { createBlankConfig, fromStoryConfig, toStoryConfig } from './state/editorModel';

const editorTheme = createTheme({ palette: { mode: 'light' } });

export const App: React.FC = () => {
  const editor = useEditorState();
  const [tab, setTab] = useState<'story' | number>(0);
  const storyConfig = useMemo(() => toStoryConfig(editor.config), [editor.config]);

  const selectedSlideIndex = typeof tab === 'number' ? tab : null;

  return (
    <ThemeProvider theme={editorTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <Toolbar
          onImport={(config) => {
            editor.setConfig(fromStoryConfig(config));
            setTab(0);
          }}
          onExport={() => storyConfig}
          onReset={() => {
            if (window.confirm('Discard the current draft and start a new blank story?')) {
              editor.setConfig(createBlankConfig());
              setTab(0);
            }
          }}
        />

        <Box sx={{ flex: 1, display: 'flex', minHeight: 0 }}>
          {/* Left: slide list + story-wide settings tab */}
          <Box sx={{ width: 260, borderRight: '1px solid', borderColor: 'divider', overflow: 'auto', p: 1.5 }}>
            <Tabs
              value={tab === 'story' ? 'story' : false}
              sx={{ mb: 1 }}
              onChange={() => setTab('story')}
            >
              <Tab label="Story settings" value="story" />
            </Tabs>
            <Divider sx={{ mb: 1.5 }} />
            <SlideList
              slides={editor.config.slides}
              selectedIndex={selectedSlideIndex ?? -1}
              onSelect={setTab}
              onAdd={() => {
                editor.addSlide();
                setTab(editor.config.slides.length);
              }}
              onRemove={(index) => {
                editor.removeSlide(index);
                if (tab === index) setTab(0);
              }}
              onMove={editor.moveSlide}
            />
          </Box>

          {/* Middle: field editor for whichever tab is selected */}
          <Box sx={{ width: 420, borderRight: '1px solid', borderColor: 'divider', overflow: 'auto', p: 2 }}>
            {tab === 'story' && <TopLevelEditor config={editor.config} onChange={editor.updateTopLevel} />}
            {typeof tab === 'number' && editor.config.slides[tab] && (
              <SlideEditor slide={editor.config.slides[tab]} slideIndex={tab} actions={editor} />
            )}
          </Box>

          {/* Right: live preview - the real, unmodified StoryViewer against the current draft */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <PreviewPane config={storyConfig} />
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};
