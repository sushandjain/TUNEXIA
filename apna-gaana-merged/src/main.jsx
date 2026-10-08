import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import PlayerContextProvider from './context/PlayerContext.jsx';
import ErrorBoundary from './components/common/ErrorBoundary.jsx';

// Register Service Worker for PWA support & offline caching in production
if ('serviceWorker' in navigator && (import.meta.env.PROD || window.location.hostname !== 'localhost')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((registration) => {
      registration.update();
    }).catch((err) => {
      console.warn('Service worker registration failed:', err);
    });
  });
}

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <StrictMode>
      <ErrorBoundary>
        <PlayerContextProvider>
          <App />
        </PlayerContextProvider>
      </ErrorBoundary>
    </StrictMode>
  </BrowserRouter>
);
