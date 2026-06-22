import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { NotchApp } from './notch/NotchApp';
import { OverlayApp } from './overlay/OverlayApp';
import './styles.css';

const RootApp =
  window.location.hash === '#/overlay'
    ? OverlayApp
    : window.location.hash === '#/notch'
      ? NotchApp
      : App;

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <RootApp />
  </StrictMode>
);
