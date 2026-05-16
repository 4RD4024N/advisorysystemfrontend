import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: { fontFamily: 'inherit' },
        success: { style: { background: '#4caf50', color: 'white' } },
        error: { style: { background: '#f44336', color: 'white' } },
      }}
      containerStyle={{ zIndex: 99999 }}
    />
    <App />
  </React.StrictMode>
);
