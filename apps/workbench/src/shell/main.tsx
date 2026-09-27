import '@ds/tokens/css';
import './shell.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

// The shell's own chrome follows the OS theme; each frame's theme is set
// independently from the toolbar.
const media = window.matchMedia('(prefers-color-scheme: dark)');
const syncTheme = () => document.documentElement.classList.toggle('dark', media.matches);
syncTheme();
media.addEventListener('change', syncTheme);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
