import '@ds/tokens/css';
import '@ds/motion/css';
import './frame.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { FrameApp } from './FrameApp';
import {
  installErrorReporting,
  installKeyForwarding,
  installLinkRouting,
  installScrollLink,
  installShellListener,
  scrollToStory,
} from './environment';

// Document-level wiring, once per frame — outside React so StrictMode's
// double-mount can't register every listener twice.
installErrorReporting();
installScrollLink();
installKeyForwarding();
installLinkRouting();
installShellListener((story, offset) => scrollToStory(story, offset));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FrameApp />
  </StrictMode>,
);
