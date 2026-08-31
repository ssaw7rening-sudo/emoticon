import { defineConfig } from 'vite'
import baseConfig from './vite.always-split-menu.config.js'

function backgroundRemovalResumeRecovery() {
  return {
    name: 'background-removal-wake-lock-resume-v1',
    enforce: 'pre',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      if (!normalizedId.endsWith('/src/components/BackgroundRemover.jsx')) return null

      let transformed = code.replace(/\r\n/g, '\n')

      const replaceOnce = (from, to, label) => {
        if (!transformed.includes(from)) {
          throw new Error(`[background-resume] ${label} anchor was not found`)
        }
        transformed = transformed.replace(from, to)
      }

      replaceOnce(
        "  const [precisionMessage, setPrecisionMessage] = useState('');",
        `  const [precisionMessage, setPrecisionMessage] = useState('');
  const [resumeNotice, setResumeNotice] = useState(false);
  const wakeLockRef = useRef(null);
  const busyRef = useRef(false);
  const fileRef = useRef(null);
  const interruptedRemovalRef = useRef(false);
  const operationIdRef = useRef(0);
  const removeBackgroundRef = useRef(null);

  const requestScreenWakeLock = async () => {
    if (typeof navigator === 'undefined' || !('wakeLock' in navigator) || document.visibilityState !== 'visible') return;
    if (wakeLockRef.current && !wakeLockRef.current.released) return;
    try {
      wakeLockRef.current = await navigator.wakeLock.request('screen');
      wakeLockRef.current.addEventListener?.('release', () => {
        wakeLockRef.current = null;
      }, { once: true });
    } catch (wakeLockError) {
      // Battery saver, browser policy, or an unsupported WebView can deny this.
      // Resume recovery below still protects the user's selected source image.
      console.warn('Screen wake lock was not available:', wakeLockError);
    }
  };

  useEffect(() => {
    busyRef.current = busy;
  }, [busy]);

  useEffect(() => {
    fileRef.current = file;
  }, [file]);

  useEffect(() => {
    if (busy) {
      requestScreenWakeLock();
    } else if (wakeLockRef.current && !wakeLockRef.current.released) {
      wakeLockRef.current.release().catch(() => {});
      wakeLockRef.current = null;
    }
    return () => {
      if (wakeLockRef.current && !wakeLockRef.current.released) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    };
  }, [busy]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible') {
        if (busyRef.current) interruptedRemovalRef.current = true;
        return;
      }

      if (busyRef.current) requestScreenWakeLock();

      if (interruptedRemovalRef.current && fileRef.current && busyRef.current) {
        interruptedRemovalRef.current = false;
        setResumeNotice(true);
        // Mobile browsers/WebViews can suspend WASM/WebWorker inference while
        // backgrounded. Restart from the already-selected File and invalidate
        // the suspended operation so stale results cannot overwrite the retry.
        window.setTimeout(() => {
          removeBackgroundRef.current?.({ forceRestart: true, resumed: true });
        }, 80);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pageshow', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pageshow', handleVisibilityChange);
    };
  }, []);`,
        'component recovery state'
      )

      replaceOnce(
        '  const removeBackground = async () => {\n    if (!file || busy) return;',
        `  const removeBackground = async ({ forceRestart = false, resumed = false } = {}) => {
    if (!file || (busy && !forceRestart)) return;
    const operationId = ++operationIdRef.current;
    if (!resumed) setResumeNotice(false);`,
        'removeBackground signature'
      )

      replaceOnce(
        `      setStage('processing');
      setProgress(null);
      const url = URL.createObjectURL(blob);`,
        `      setStage('processing');
      setProgress(null);
      if (operationIdRef.current !== operationId) return;
      const url = URL.createObjectURL(blob);`,
        'stale result guard'
      )

      replaceOnce(
        `    } catch (e) {
      console.error('Background removal failed:', e);
      setError(t.failed);
    } finally {
      setBusy(false);
      setStage('');
      setProgress(null);
    }
  };

  const runPrecisionRetry = async () => {`,
        `    } catch (e) {
      if (operationIdRef.current === operationId) {
        console.error('Background removal failed:', e);
        setError(t.failed);
      }
    } finally {
      if (operationIdRef.current === operationId) {
        setBusy(false);
        setStage('');
        setProgress(null);
        interruptedRemovalRef.current = false;
      }
    }
  };
  removeBackgroundRef.current = removeBackground;

  const runPrecisionRetry = async () => {`,
        'operation completion guard'
      )

      replaceOnce(
        `              {typeof progress === 'number' && (
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#EFEAE2]"><div className="h-full rounded-full bg-[#7D9A75] transition-all" style={{ width: \`${'${progress}'}%\` }} /></div>
              )}
            </div>`,
        `              {typeof progress === 'number' && (
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#EFEAE2]"><div className="h-full rounded-full bg-[#7D9A75] transition-all" style={{ width: \`${'${progress}'}%\` }} /></div>
              )}
              <div className="mt-2 text-[11px] sm:text-xs font-semibold leading-5 text-[#7B7164]">
                {resumeNotice
                  ? (lang === 'ko' ? '↻ 다른 앱 사용으로 작업이 중단되어 자동으로 다시 시작했습니다.' : lang === 'ja' ? '↻ バックグラウンドで中断されたため、自動的に再開しました。' : lang === 'zh' ? '↻ 切换到其他应用后任务被暂停，现已自动重新开始。' : '↻ Processing was interrupted in the background and restarted automatically.')
                  : (lang === 'ko' ? '☀ 처리 중에는 화면 꺼짐을 방지합니다. 다른 앱으로 이동하면 복귀 시 자동으로 다시 시작합니다.' : lang === 'ja' ? '☀ 処理中は画面のスリープを防ぎます。他のアプリから戻ると自動的に再開します。' : lang === 'zh' ? '☀ 处理期间会尽量保持屏幕唤醒；切换应用后返回时会自动重新开始。' : '☀ The screen is kept awake while processing when supported. If you switch apps, processing restarts automatically when you return.')}
              </div>
            </div>`,
        'processing recovery notice'
      )

      return { code: transformed, map: null }
    },
  }
}

export default defineConfig({
  ...baseConfig,
  plugins: [...(baseConfig.plugins || []), backgroundRemovalResumeRecovery()],
})
