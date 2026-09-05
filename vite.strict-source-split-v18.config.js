import { defineConfig } from 'vite'
import baseConfig from './vite.alpha-verified-v17.config.js'

function strictSourceSplitV18() {
  return {
    name: 'strict-source-split-v18',
    enforce: 'post',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      let transformed = code.replace(/\r\n/g, '\n')

      if (normalizedId.endsWith('/src/components/BackgroundRemover.jsx')) {
        const startMarker = '  const autoSplit = async () => {'
        const endMarker = '  autoSplitCallbackRef.current = autoSplit;'
        const start = transformed.indexOf(startMarker)
        const end = transformed.indexOf(endMarker, start)
        if (start < 0 || end < 0 || end <= start) {
          throw new Error('[split-v18] autoSplit boundaries not found')
        }

        const strictAutoSplit = `  const autoSplit = async () => {
    if (!resultBlob || splitting || qualityAssessment.status === 'fail') return;
    clearSplitItems();
    setSplitting(true);
    setSplitError('');
    try {
      const sourceDarkInfo = await inspectOriginalDarkSource(file);
      let items = null;
      let splitEngine = 'STD18';

      if (sourceDarkInfo.isDark) {
        // v18 strict rule: for a demonstrably dark original sheet, the first
        // uploaded file is the ONLY source allowed for the 15 exported PNGs.
        // Never fall back to a semantic/AI-processed resultBlob because pale
        // faces and white sticker fills may already have lost alpha there.
        items = await splitOriginalDarkSheetDirectly(file);
        splitEngine = 'D18';
        if (!items || items.length !== 15) {
          throw new Error('D18 원본 직접 분리 실패 · AI 결과 fallback 차단 · dark=' + sourceDarkInfo.ratio.toFixed(3));
        }
      } else {
        items = await splitIntoFifteen(resultBlob, file);
        splitEngine = 'STD18';
      }

      if (!items || items.length === 0) {
        throw new Error('No stickers detected');
      }

      const inspectedItems = [];
      for (const item of items) {
        const alphaDiag = await inspectSplitAlphaTopology(item.blob);
        inspectedItems.push({
          ...item,
          splitEngine,
          sourceDarkRatio: sourceDarkInfo.ratio,
          alphaDiag
        });
      }

      const withUrls = inspectedItems.map((item) => ({
        ...item,
        url: URL.createObjectURL(item.blob)
      }));
      setSplitItems(withUrls);
      setPrecisionMessage(
        'Split v18 · ' + splitEngine +
        ' · H' + (inspectedItems[0]?.alphaDiag?.holes ?? '?') +
        ' · S' + (inspectedItems[0]?.alphaDiag?.semi ?? '?') +
        ' · Z' + (typeof inspectedItems[0]?.alphaDiag?.zeroRatio === 'number' ? inspectedItems[0].alphaDiag.zeroRatio.toFixed(3) : '?')
      );
      setTimeout(() => {
        splitCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
    } catch (e) {
      console.error('Sticker auto split failed:', e);
      setSplitError(\`${'${t.splitFailed}'} [원인: ${'${e?.message || String(e)}'}]\`);
    } finally {
      setSplitting(false);
    }
  };

`
        transformed = transformed.slice(0, start) + strictAutoSplit + transformed.slice(end)
        transformed = transformed.replace(/Split v17 · Alpha Verified/g, 'Split v18 · Strict Source')
        return { code: transformed, map: null }
      }

      if (normalizedId.endsWith('/src/components/EmoticonPostProcessor.jsx')) {
        const labelToken = '{engineLabel}'
        const labelReplacement = "{engineLabel} · {processed[0]?.splitEngine || 'NA'} · H{processed[0]?.alphaDiag?.holes ?? '?'} · S{processed[0]?.alphaDiag?.semi ?? '?'}"
        if (transformed.includes(labelToken)) {
          transformed = transformed.replace(labelToken, labelReplacement)
        }
        return { code: transformed, map: null }
      }

      return null
    }
  }
}

export default defineConfig({
  ...baseConfig,
  plugins: [...(baseConfig.plugins || []), strictSourceSplitV18()]
})
