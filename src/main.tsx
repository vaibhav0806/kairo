import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { OverlayApp } from './overlay/OverlayApp';
import './styles.css';

const RootApp = window.location.hash === '#/overlay' ? OverlayApp : App;

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <RootApp />
  </StrictMode>
);
