import { defineConfig } from 'vite'
import baseConfig from './vite.app-runtime-resilience.config.js'

function uiRuntimeCleanup() {
  return {
    name: 'ui-runtime-cleanup-v2-source-css',
    enforce: 'pre',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      if (!normalizedId.endsWith('/src/App.jsx')) return null

      let transformed = code.replace(/\r\n/g, '\n')

      const historyStart = transformed.indexOf(
        "  useEffect(() => {\n    if (typeof window === 'undefined') return undefined;\n\n    const legacyLang"
      )
      const navigateStart = transformed.indexOf('\n\n  const navigateTo = (path) => {', historyStart)
      if (historyStart < 0 || navigateStart < 0) {
        throw new Error('[ui-runtime-cleanup] history listener boundaries were not found')
      }

      const consolidatedHistory = `  const [currentPath, setCurrentPath] = useState(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      if (path === '/privacy' || path === '/terms') return path;
    }
    return '/';
  });

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const legacyLang = new URLSearchParams(window.location.search).get('lang');
    if (['ko', 'en', 'ja', 'zh'].includes(legacyLang) && window.location.pathname === '/') {
      window.history.replaceState({ lang: legacyLang }, '', APP_LOCALE_PATHS[legacyLang]);
    }

    const syncLocationState = () => {
      setLang(getAppLanguageFromLocation());
      const path = window.location.pathname.toLowerCase();
      setCurrentPath(path === '/privacy' || path === '/terms' ? path : '/');
    };

    window.addEventListener('popstate', syncLocationState);
    return () => window.removeEventListener('popstate', syncLocationState);
  }, []);`

      transformed = transformed.slice(0, historyStart)
        + consolidatedHistory
        + transformed.slice(navigateStart)

      const toastStart = transformed.indexOf('  const showToast = (msg) => {')
      const applyGoldenComboStart = transformed.indexOf('\n\n  const applyGoldenCombo = (combo) => {', toastStart)
      if (toastStart < 0 || applyGoldenComboStart < 0) {
        throw new Error('[ui-runtime-cleanup] toast helper boundaries were not found')
      }

      const safeToastHelper = `  const toastTimerRef = useRef(null);

  useEffect(() => () => {
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
  }, []);

  const showToast = (msg) => {
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    setToastMessage(msg);
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage('');
      toastTimerRef.current = null;
    }, 3000);
  };`

      transformed = transformed.slice(0, toastStart)
        + safeToastHelper
        + transformed.slice(applyGoldenComboStart)

      return { code: transformed, map: null }
    },
  }
}

export default defineConfig({
  ...baseConfig,
  plugins: [...(baseConfig.plugins || []), uiRuntimeCleanup()],
})
