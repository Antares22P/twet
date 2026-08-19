import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { OrbitProvider } from './context/OrbitContext';
import { SoundProvider } from './context/SoundContext';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SoundProvider>
      <OrbitProvider>
        <App />
      </OrbitProvider>
    </SoundProvider>
  </React.StrictMode>
);
