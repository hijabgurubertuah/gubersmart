import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { firebaseSync } from './services/firebaseSync';

// Initialize Firebase Realtime Sync
firebaseSync.init().catch((err) => {
  console.warn('Firebase sync init notice:', err);
});

createRoot(document.getElementById('root')!).render(<App />);

