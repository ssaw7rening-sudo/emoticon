import { defineConfig } from 'vite'
import baseConfig from './vite.background-resume.config.js'

function appRuntimeResilience() {
  return {
    name: 'app-runtime-resilience-v1',
    enforce: 'pre',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      if (!normalizedId.endsWith('/src/App.jsx')) return null

      let transformed = code.replace(/\r\n/g, '\n')

      const replaceOnce = (from, to, label) => {
        if (!transformed.includes(from)) {
          throw new Error(`[app-runtime] ${label} anchor was not found`)
        }
        transformed = transformed.replace(from, to)
      }

      const scrollEffectStart = transformed.indexOf(
        "  useEffect(() => {\n    const updateGoldenComboScrollCues = () => {"
      )
      const categoryStart = transformed.indexOf('\n\n  const getCategoryRuleBadge', scrollEffectStart)
      if (scrollEffectStart < 0 || categoryStart < 0) {
        throw new Error('[app-runtime] scroll/viewport effect boundaries were not found')
      }

      const improvedEffects = `  useEffect(() => {
    const element = goldenComboScrollRef.current;
    if (!element) return undefined;

    let frameId = 0;
    const updateGoldenComboScrollCues = () => {
      frameId = 0;
      const maxScrollLeft = Math.max(0, element.scrollWidth - element.clientWidth);
      const next = {
        left: element.scrollLeft > 8,
        right: element.scrollLeft < maxScrollLeft - 8,
      };
      setGoldenComboScrollCues((previous) => (
        previous.left === next.left && previous.right === next.right ? previous : next
      ));
    };
    const scheduleUpdate = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame(updateGoldenComboScrollCues);
    };

    scheduleUpdate();
    element.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate, { passive: true });
    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      element.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
    };
  }, [lang]);

  useEffect(() => {
    if (!showThemePicker) return undefined;
    const viewport = window.visualViewport;
    let frameId = 0;

    const updateViewportHeight = () => {
      frameId = 0;
      const nextHeight = Math.round(viewport?.height || window.innerHeight);
      setThemePickerViewportHeight((previous) => previous === nextHeight ? previous : nextHeight);
    };
    const scheduleViewportUpdate = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame(updateViewportHeight);
    };

    scheduleViewportUpdate();
    viewport?.addEventListener('resize', scheduleViewportUpdate, { passive: true });
    viewport?.addEventListener('scroll', scheduleViewportUpdate, { passive: true });
    window.addEventListener('resize', scheduleViewportUpdate, { passive: true });
    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      viewport?.removeEventListener('resize', scheduleViewportUpdate);
      viewport?.removeEventListener('scroll', scheduleViewportUpdate);
      window.removeEventListener('resize', scheduleViewportUpdate);
    };
  }, [showThemePicker]);`

      transformed = transformed.slice(0, scrollEffectStart)
        + improvedEffects
        + transformed.slice(categoryStart)

      const socialAnchor = "  const copySocialCaption = (mode = 'ko') => {"
      if (!transformed.includes(socialAnchor)) {
        throw new Error('[app-runtime] social copy anchor was not found')
      }

      const clipboardHelper = `  // SAFE_CLIPBOARD_HELPER_V1
  const getClipboardFailureMessage = () => (
    lang === 'ko' ? '⚠️ 자동 복사에 실패했습니다. 브라우저의 클립보드 권한을 확인해 주세요.'
      : lang === 'ja' ? '⚠️ 自動コピーに失敗しました。ブラウザのクリップボード権限を確認してください。'
      : lang === 'zh' ? '⚠️ 自动复制失败。请检查浏览器的剪贴板权限。'
      : '⚠️ Automatic copy failed. Please check your browser clipboard permission.'
  );

  const copyTextToClipboardSafe = async (text) => {
    let clipboardError = null;

    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (error) {
        clipboardError = error;
      }
    }

    if (typeof document === 'undefined' || !document.body) {
      throw clipboardError || new Error('Clipboard is unavailable');
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.setAttribute('aria-hidden', 'true');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '0';
    textarea.style.opacity = '0';

    const activeElement = document.activeElement;
    document.body.appendChild(textarea);
    let copied = false;
    try {
      textarea.focus({ preventScroll: true });
      textarea.select();
      textarea.setSelectionRange(0, textarea.value.length);
      copied = typeof document.execCommand === 'function' && document.execCommand('copy');
    } catch (error) {
      clipboardError = clipboardError || error;
    } finally {
      textarea.remove();
      try { activeElement?.focus?.({ preventScroll: true }); } catch (error) { /* noop */ }
    }

    if (!copied) throw clipboardError || new Error('Clipboard copy failed');
    return true;
  };

`
      transformed = transformed.replace(socialAnchor, clipboardHelper + socialAnchor)

      replaceOnce(
        "    navigator.clipboard.writeText(text);\n    setCopiedType(`social_${mode}`);\n    setTimeout(() => setCopiedType(null), 2500);",
        "    copyTextToClipboardSafe(text)\n      .then(() => {\n        setCopiedType(`social_${mode}`);\n        setTimeout(() => setCopiedType(null), 2500);\n      })\n      .catch(() => showToast(getClipboardFailureMessage()));",
        'social clipboard call'
      )

      replaceOnce(
        "    navigator.clipboard.writeText(getRepairPrompt(repairType, textMode, model));\n    setCopiedType(`${keyPrefix}-${repairType}`);\n    setTimeout(() => setCopiedType(null), 2500);",
        "    copyTextToClipboardSafe(getRepairPrompt(repairType, textMode, model))\n      .then(() => {\n        setCopiedType(`${keyPrefix}-${repairType}`);\n        setTimeout(() => setCopiedType(null), 2500);\n      })\n      .catch(() => showToast(getClipboardFailureMessage()));",
        'repair clipboard call'
      )

      replaceOnce(
        "    // 1. Copy to clipboard\n    navigator.clipboard.writeText(textToCopy);\n    setCopiedType(type);\n    setTimeout(() => setCopiedType(null), 3000);",
        "    // 1. Start clipboard copy without awaiting so the popup remains inside the user gesture.\n    const clipboardPromise = copyTextToClipboardSafe(textToCopy);",
        'launch clipboard start'
      )

      const popupStart = transformed.indexOf('    const popup = window.open(targetUrl, `AI_Companion_${type}`, popupFeatures);')
      const launchEnd = transformed.indexOf('\n  };\n\n  const handlePreviewCopyAttempt', popupStart)
      if (popupStart < 0 || launchEnd < 0) {
        throw new Error('[app-runtime] launch popup block boundaries were not found')
      }

      const popupReplacement = `    const popup = window.open(targetUrl, \`AI_Companion_\${type}\`, popupFeatures);
    const openedInPopup = Boolean(popup);
    if (!popup) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }

    clipboardPromise
      .then(() => {
        setCopiedType(type);
        setTimeout(() => setCopiedType(null), 3000);
        showToast(lang === 'ko'
          ? (openedInPopup
            ? \`📋 프롬프트 자동 복사 완료! 우측 \${toastName} 창에서 [Ctrl + V]로 붙여넣으세요.\`
            : '📋 프롬프트 자동 복사 완료! 새 창에서 [Ctrl + V]로 붙여넣으세요.')
          : (openedInPopup
            ? \`📋 Prompt auto-copied! Press [Ctrl + V] in the \${toastName} side window.\`
            : '📋 Prompt auto-copied! Press [Ctrl + V] in the new tab.'));
      })
      .catch(() => {
        showToast(lang === 'ko'
          ? '⚠️ AI 사이트는 열렸지만 자동 복사에 실패했습니다. 아래 복사 버튼을 이용해 주세요.'
          : lang === 'ja'
            ? '⚠️ AIサイトは開きましたが、自動コピーに失敗しました。コピー用ボタンをご利用ください。'
            : lang === 'zh'
              ? '⚠️ AI 网站已打开，但自动复制失败。请使用下方复制按钮。'
              : '⚠️ The AI site opened, but automatic copy failed. Please use the copy button below.');
      });`

      transformed = transformed.slice(0, popupStart)
        + popupReplacement
        + transformed.slice(launchEnd)

      replaceOnce(
        "    navigator.clipboard.writeText(textToCopy);\n    setCopiedType(copyKey);\n    setTimeout(() => setCopiedType(null), 2500);\n    showToast(lang === 'ko' ? '📋 프롬프트가 복사되었습니다!' : lang === 'ja' ? '📋 プロンプトをコピーしました！' : lang === 'zh' ? '📋 提示词已复制！' : '📋 Prompt copied to clipboard!');",
        "    copyTextToClipboardSafe(textToCopy)\n      .then(() => {\n        setCopiedType(copyKey);\n        setTimeout(() => setCopiedType(null), 2500);\n        showToast(lang === 'ko' ? '📋 프롬프트가 복사되었습니다!' : lang === 'ja' ? '📋 プロンプトをコピーしました！' : lang === 'zh' ? '📋 提示词已复制！' : '📋 Prompt copied to clipboard!');\n      })\n      .catch(() => showToast(getClipboardFailureMessage()));",
        'main clipboard call'
      )

      return { code: transformed, map: null }
    },
  }
}

export default defineConfig({
  ...baseConfig,
  plugins: [...(baseConfig.plugins || []), appRuntimeResilience()],
})
