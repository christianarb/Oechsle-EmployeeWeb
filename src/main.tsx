import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import { authService } from './infrastructure/auth/AuthService';

authService.init().finally(() => {
  createRoot(document.getElementById('root')!).render(
  
      <App />
   
  );
});