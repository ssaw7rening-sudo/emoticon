// 애플리케이션 진입점 및 PWA 서비스 워커 등록
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './accessibility.css'
import './background-remover-link.css'
import App from './App.jsx'
import AppErrorBoundary from './components/AppErrorBoundary.jsx'

const currentPath = window.location.pathname.toLowerCase()
document.documentElement.dataset.page = /(^|\/)background-remover\/?$/.test(currentPath)
  ? 'background-remover'
  : 'prompt-maker'

if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', async () => {
    let reloadingForUpdate = false;

    // A newly activated worker can otherwise leave an already-open mobile/PWA
    // window running the previous JavaScript bundle. Reload exactly once when
    // the new worker takes control so background-removal fixes are immediate.
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (reloadingForUpdate) return;
      reloadingForUpdate = true;
      window.location.reload();
    });

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        updateViaCache: 'none',
      });
      await registration.update();
    } catch {
      // Offline support is optional; the application must still start.
    }
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </StrictMode>,
)
