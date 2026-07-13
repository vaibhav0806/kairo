import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { CursorApp } from './cursor/CursorApp';
import { LandingPage } from './landing/LandingPage';
import { NotchApp } from './notch/NotchApp';
import { OverlayApp } from './overlay/OverlayApp';
import { installGlobalErrorLogging, klog } from './core/logger';
import { resolveRootRoute } from './rootRoute';
import '@fontsource-variable/geist';
import './styles.css';

// Record uncaught errors/rejections from this WebView into the shared Kairo log.
installGlobalErrorLogging();

const route = resolveRootRoute(window.location.hash);
const RootApp = {
  landing: LandingPage,
  app: App,
  notch: NotchApp,
  overlay: OverlayApp,
  cursor: CursorApp
}[route];

klog('boot', 'info', 'webview mounted', { route });

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <RootApp />
  </StrictMode>
);
