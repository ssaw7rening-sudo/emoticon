import { defineConfig } from 'vite'
import baseConfig from './vite.always-split-menu.config.js'

function backgroundRemovalResumeRecovery() {
  return {
    name: 'background-removal-wake-lock-resume-v3',
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

      // Earlier build plugins can rewrite the exact catch/finally body, so locate
      // the outer removeBackground tail structurally instead of matching its full text.
      const removeStart = transformed.indexOf('  const removeBackground = async ({ forceRestart = false, resumed = false } = {}) => {')
      const retryStart = transformed.indexOf('  const runPrecisionRetry = async () => {', removeStart)
      if (removeStart < 0 || retryStart < 0) {
        throw new Error('[background-resume] removeBackground function boundaries were not found')
      }

      const outerCatch = transformed.lastIndexOf('    } catch (e) {', retryStart)
      const outerFinally = transformed.lastIndexOf('    } finally {', retryStart)
      if (outerCatch < removeStart || outerFinally < outerCatch) {
        throw new Error('[background-resume] removeBackground catch/finally blocks were not found')
      }

      const catchBodyStart = outerCatch + '    } catch (e) {'.length
      transformed = transformed.slice(0, catchBodyStart) + `
      if (operationIdRef.current !== operationId) return;` + transformed.slice(catchBodyStart)

      // Recompute the positions after inserting the catch guard.
      const retryStartAfterCatch = transformed.indexOf('  const runPrecisionRetry = async () => {', removeStart)
      const outerFinallyAfterCatch = transformed.lastIndexOf('    } finally {', retryStartAfterCatch)
      const finallyBodyStart = outerFinallyAfterCatch + '    } finally {'.length
      transformed = transformed.slice(0, finallyBodyStart) + `
      if (operationIdRef.current !== operationId) return;` + transformed.slice(finallyBodyStart)

      const retryStartFinal = transformed.indexOf('  const runPrecisionRetry = async () => {', removeStart)
      transformed = transformed.slice(0, retryStartFinal) + '  removeBackgroundRef.current = removeBackground;\n\n' + transformed.slice(retryStartFinal)

      const busyAnchor = '          {busy && ('
      const recoveryNotice = `          {busy && (
            <div className="mt-3 rounded-xl border border-[#E8DFD1] bg-[#FFFDF9] px-3.5 py-2.5 text-[11px] sm:text-xs font-semibold leading-5 text-[#7B7164]">
              {resumeNotice
                ? (lang === 'ko' ? '↻ 다른 앱 사용으로 작업이 중단되어 자동으로 다시 시작했습니다.' : lang === 'ja' ? '↻ バックグラウンドで中断されたため、自動的に再開しました。' : lang === 'zh' ? '↻ 切换到其他应用后任务被暂停，现已自动重新开始。' : '↻ Processing was interrupted in the background and restarted automatically.')
                : (lang === 'ko' ? '☀ 처리 중에는 화면 꺼짐을 방지합니다. 다른 앱으로 이동하면 복귀 시 자동으로 다시 시작합니다.' : lang === 'ja' ? '☀ 処理中は画面のスリープを防ぎます。他のアプリから戻ると自動的に再開します。' : lang === 'zh' ? '☀ 处理期间会尽量保持屏幕唤醒；切换应用后返回时会自动重新开始。' : '☀ The screen is kept awake while processing when supported. If you switch apps, processing restarts automatically when you return.')}
            </div>
          )}

          {busy && (`
      replaceOnce(busyAnchor, recoveryNotice, 'processing recovery notice')

      return { code: transformed, map: null }
    },
  }
}

export default defineConfig({
  ...baseConfig,
  plugins: [...(baseConfig.plugins || []), backgroundRemovalResumeRecovery()],
})
