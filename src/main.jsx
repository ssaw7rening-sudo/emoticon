// 애플리케이션 진입점 및 PWA 서비스 워커 등록
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './background-remover-link.css'
import App from './App.jsx'
import AppErrorBoundary from './components/AppErrorBoundary.jsx'

const currentPath = window.location.pathname.toLowerCase()
document.documentElement.dataset.page = /(^|\/)background-remover\/?$/.test(currentPath)
  ? 'background-remover'
  : 'prompt-maker'

if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </StrictMode>,
)
