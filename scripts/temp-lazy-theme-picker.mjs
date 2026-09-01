import fs from 'node:fs';
import { execSync, spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

const run = (command, options = {}) => execSync(command, { stdio: 'inherit', ...options });
const readEntry = () => {
  const html = fs.readFileSync('dist/index.html', 'utf8');
  const match = html.match(/<script[^>]+type=["']module["'][^>]+src=["']([^"']+)["']/i)
    || html.match(/<script[^>]+src=["']([^"']+)["'][^>]+type=["']module["']/i);
  if (!match) throw new Error('entry module not found');
  const file = `dist/${match[1].replace(/^\//, '')}`;
  return { file, size: fs.statSync(file).size };
};

run('npm ci');
run('npm run build');
const baseline = readEntry();
console.log('THEME_PICKER_BASELINE', JSON.stringify(baseline));

const appPath = 'src/App.jsx';
let app = fs.readFileSync(appPath, 'utf8');
const startMarker = '          {showThemePicker && (\n';
const nextMarker = '\n\n          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5 md:gap-3 bg-white rounded-xl p-3 sm:p-3.5 shadow-bubbly border-2 border-[#C6E7DA]">';
const suffix = '\n          )}';
const start = app.indexOf(startMarker);
const next = app.indexOf(nextMarker, start);
if (start < 0 || next < 0) throw new Error('theme picker boundaries not found');
const pickerBlock = app.slice(start, next);
if (!pickerBlock.endsWith(suffix)) throw new Error('theme picker wrapper mismatch');
if (!pickerBlock.includes('themePickerViewportHeight') || !pickerBlock.includes('filteredThemeKeys') || !pickerBlock.includes('recentThemeKeys')) {
  throw new Error('theme picker dependency anchors missing');
}
const pickerJsx = pickerBlock.slice(startMarker.length, pickerBlock.length - suffix.length);
const componentFile = `import React from 'react';\n\nexport default function ThemePickerModal({\n  t,\n  lang,\n  themeKeys,\n  themePickerViewportHeight,\n  themeSearch,\n  setThemeSearch,\n  normalizedThemeSearch,\n  recentThemeKeys,\n  selectPopularTheme,\n  activeTheme,\n  filteredThemeKeys,\n  setShowThemePicker,\n}) {\n  return (\n${pickerJsx}\n  );\n}\n`;
fs.writeFileSync('src/components/ThemePickerModal.jsx', componentFile);

const importAnchor = 'const PartnershipModal = React.lazy(() => import("./components/PartnershipModal.jsx"));';
if (app.split(importAnchor).length !== 2) throw new Error('lazy import anchor count mismatch');
const lazyImport = 'const ThemePickerModal = React.lazy(() => import("./components/ThemePickerModal.jsx"));';
app = app.replace(importAnchor, `${importAnchor}\n${lazyImport}`);

const replacement = `          {showThemePicker && (\n            <React.Suspense fallback={null}>\n              <ThemePickerModal\n                t={t}\n                lang={lang}\n                themeKeys={themeKeys}\n                themePickerViewportHeight={themePickerViewportHeight}\n                themeSearch={themeSearch}\n                setThemeSearch={setThemeSearch}\n                normalizedThemeSearch={normalizedThemeSearch}\n                recentThemeKeys={recentThemeKeys}\n                selectPopularTheme={selectPopularTheme}\n                activeTheme={activeTheme}\n                filteredThemeKeys={filteredThemeKeys}\n                setShowThemePicker={setShowThemePicker}\n              />\n            </React.Suspense>\n          )}`;
const updatedStart = app.indexOf(startMarker);
const updatedNext = app.indexOf(nextMarker, updatedStart);
if (updatedStart < 0 || updatedNext < 0) throw new Error('updated theme picker boundaries not found');
app = app.slice(0, updatedStart) + replacement + app.slice(updatedNext);
if (app.split(lazyImport).length !== 2) throw new Error('ThemePickerModal lazy import count mismatch');
if (app.split('<ThemePickerModal').length !== 2) throw new Error('ThemePickerModal JSX count mismatch');
fs.writeFileSync(appPath, app);
run('git diff --check');

run('npm run build');
const optimized = readEntry();
const savings = baseline.size - optimized.size;
const pct = Number(((savings / baseline.size) * 100).toFixed(2));
const assets = fs.readdirSync('dist/assets');
const pickerChunks = assets.filter(name => /^ThemePickerModal-/i.test(name));
console.log('THEME_PICKER_OPTIMIZED', JSON.stringify({ ...optimized, baselineSize: baseline.size, savings, pct, pickerChunks }));
if (savings < 1500) throw new Error(`theme picker lazy-load savings too small: ${savings}`);
if (pickerChunks.length !== 1) throw new Error(`expected one ThemePickerModal chunk, got ${pickerChunks.length}`);

run('npm install --no-save --no-package-lock playwright@1.55.0');
run('npx playwright install chromium --with-deps');
const preview = spawn('npx', ['vite', 'preview', '--host', '127.0.0.1', '--port', '4173'], { stdio: ['ignore', 'pipe', 'pipe'] });
try {
  let ready = false;
  for (let i = 0; i < 30; i += 1) {
    await delay(1000);
    try {
      const response = await fetch('http://127.0.0.1:4173/');
      if (response.ok) { ready = true; break; }
    } catch {}
  }
  if (!ready) throw new Error('preview server did not become ready');
  const { chromium } = await import('playwright');
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    const scripts = [];
    const errors = [];
    page.on('response', r => { if (r.url().includes('/assets/') && r.url().endsWith('.js')) scripts.push(r.url()); });
    page.on('pageerror', e => errors.push(String(e)));
    await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
    if (scripts.some(url => /ThemePickerModal-/i.test(url))) throw new Error('ThemePickerModal loaded on initial main route');
    await page.getByRole('button', { name: /테마 변경/ }).click();
    const search = page.getByPlaceholder('테마 또는 문구 검색 (예: 수능, 회사, 할로윈)');
    await search.waitFor();
    if (!scripts.some(url => /ThemePickerModal-/i.test(url))) throw new Error('ThemePickerModal chunk did not load after opening');
    await search.fill('__no_theme_match__');
    await page.getByText('검색 결과가 없습니다. 다른 단어를 입력해 보세요.', { exact: true }).waitFor();
    if (errors.length) throw new Error(`main page errors: ${errors.join(' | ')}`);
    await page.getByRole('button', { name: '닫기' }).click();
    await search.waitFor({ state: 'hidden' });
    await context.close();
  } finally {
    await browser.close();
  }
  console.log('THEME_PICKER_BROWSER_SMOKE_OK');
} finally {
  preview.kill('SIGTERM');
}

run('git restore package.json package-lock.json || true', { shell: '/bin/bash' });
fs.rmSync('.github/workflows/temp-lazy-theme-picker.yml');
fs.rmSync('scripts/temp-lazy-theme-picker.mjs');
run('git diff --check');
run('git add src/App.jsx src/components/ThemePickerModal.jsx .github/workflows/temp-lazy-theme-picker.yml scripts/temp-lazy-theme-picker.mjs');
const changed = execSync("git diff --cached origin/main --name-only | sort | tr '\n' ' '", { encoding: 'utf8', shell: '/bin/bash' });
console.log(`FINAL_STAGED_FILES=${changed}`);
if (changed !== 'src/App.jsx src/components/ThemePickerModal.jsx ') throw new Error(`unexpected final staged files: ${changed}`);
run('git config user.name "github-actions[bot]"', { shell: '/bin/bash' });
run('git config user.email "41898282+github-actions[bot]@users.noreply.github.com"', { shell: '/bin/bash' });
run('git commit -m "Lazy-load theme picker [skip ci]"', { shell: '/bin/bash' });
run('git push origin HEAD:perf/lazy-theme-picker', { shell: '/bin/bash' });
