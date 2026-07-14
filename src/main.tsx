import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { LandingPage } from './landing/LandingPage';
import '@fontsource-variable/geist';
import '@fontsource/instrument-serif';
import './styles.css';

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <LandingPage />
  </StrictMode>
);
