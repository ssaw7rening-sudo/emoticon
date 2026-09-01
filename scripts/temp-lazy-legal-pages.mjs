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
console.log('LEGAL_BASELINE', JSON.stringify(baseline));

const appPath = 'src/App.jsx';
let text = fs.readFileSync(appPath, 'utf8');
const startMarker = 'const PrivacyPage = ({ lang, onBack }) => {';
const endMarker = '// 메인 하단 섹션 1: 이모티콘 제작이 처음인가요? (About AI Prompt Maker)';
if ((text.match(new RegExp(startMarker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length !== 1) throw new Error('privacy start marker count mismatch');
if ((text.match(new RegExp(endMarker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length !== 1) throw new Error('legal end marker count mismatch');
const start = text.indexOf(startMarker);
const end = text.indexOf(endMarker, start);
const legalBlock = text.slice(start, end).trimEnd();
if ((legalBlock.match(/const PrivacyPage =/g) || []).length !== 1 || (legalBlock.match(/const TermsPage =/g) || []).length !== 1) {
  throw new Error('legal component extraction mismatch');
}
const legalFile = `import React from 'react';\n\n${legalBlock}\n\nexport default function LegalPages({ page, lang, onBack }) {\n  return page === 'terms'\n    ? <TermsPage lang={lang} onBack={onBack} />\n    : <PrivacyPage lang={lang} onBack={onBack} />;\n}\n`;
fs.writeFileSync('src/components/LegalPages.jsx', legalFile);
text = text.slice(0, start) + text.slice(end);

const importAnchor = 'const BackgroundRemoverLanding = React.lazy(() => import("./components/BackgroundRemoverLanding.jsx"));';
if (text.split(importAnchor).length !== 2) throw new Error('import anchor count mismatch');
text = text.replace(importAnchor, `${importAnchor}\nconst LegalPages = React.lazy(() => import("./components/LegalPages.jsx"));`);

const routeAnchor = `if (currentPath === '/privacy') {\n    return <PrivacyPage lang={lang} onBack={() => navigateTo('/')} />;\n  }\n\n  if (currentPath === '/terms') {\n    return <TermsPage lang={lang} onBack={() => navigateTo('/')} />;\n  }`;
if (text.split(routeAnchor).length !== 2) throw new Error('legal route anchor count mismatch');
const routeTarget = `if (currentPath === '/privacy' || currentPath === '/terms') {\n    return (\n      <React.Suspense fallback={<div className="min-h-screen bg-[#FFFDF8]" />}>\n        <LegalPages\n          page={currentPath === '/terms' ? 'terms' : 'privacy'}\n          lang={lang}\n          onBack={() => navigateTo('/')}\n        />\n      </React.Suspense>\n    );\n  }`;
text = text.replace(routeAnchor, routeTarget);
if (text.includes('const PrivacyPage =') || text.includes('const TermsPage =')) throw new Error('inline legal components remain');
fs.writeFileSync(appPath, text);

const legalVitePath = 'vite.legal-notices.config.js';
let legalVite = fs.readFileSync(legalVitePath, 'utf8');
const viteAnchor = "      if (!normalizedId.endsWith('/src/App.jsx')) return null";
const viteTarget = "      if (!normalizedId.endsWith('/src/components/LegalPages.jsx')) return null";
if (legalVite.split(viteAnchor).length !== 2) throw new Error('legal notices Vite target anchor mismatch');
legalVite = legalVite.replace(viteAnchor, viteTarget);
fs.writeFileSync(legalVitePath, legalVite);
run('git diff --check');

run('npm run build');
const optimized = readEntry();
const savings = baseline.size - optimized.size;
const pct = Number(((savings / baseline.size) * 100).toFixed(2));
const assets = fs.readdirSync('dist/assets');
const legalChunks = assets.filter(name => /^LegalPages-/i.test(name));
console.log('LEGAL_OPTIMIZED', JSON.stringify({ ...optimized, baselineSize: baseline.size, savings, pct, legalChunks }));
if (savings < 1000) throw new Error(`legal lazy-load savings too small: ${savings}`);
if (legalChunks.length !== 1) throw new Error(`expected one LegalPages chunk, got ${legalChunks.length}`);
const legalChunkCode = fs.readFileSync(`dist/assets/${legalChunks[0]}`, 'utf8');
if (!legalChunkCode.includes('2026년 8월 31일') || !legalChunkCode.includes('제3자 오픈소스 소프트웨어')) {
  throw new Error('legal notices transform did not apply to LegalPages chunk');
}

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
    const main = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const mainPage = await main.newPage();
    const mainScripts = [];
    const mainErrors = [];
    mainPage.on('response', r => { if (r.url().includes('/assets/') && r.url().endsWith('.js')) mainScripts.push(r.url()); });
    mainPage.on('pageerror', e => mainErrors.push(String(e)));
    await mainPage.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
    if (mainScripts.some(url => /LegalPages-/i.test(url))) throw new Error('LegalPages loaded on initial main route');
    if (mainErrors.length) throw new Error(`main page errors: ${mainErrors.join(' | ')}`);
    await main.close();

    const privacy = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const privacyPage = await privacy.newPage();
    const privacyScripts = [];
    const privacyErrors = [];
    privacyPage.on('response', r => { if (r.url().includes('/assets/') && r.url().endsWith('.js')) privacyScripts.push(r.url()); });
    privacyPage.on('pageerror', e => privacyErrors.push(String(e)));
    await privacyPage.goto('http://127.0.0.1:4173/privacy', { waitUntil: 'networkidle' });
    await privacyPage.getByText('개인정보처리방침', { exact: true }).waitFor();
    if (!privacyScripts.some(url => /LegalPages-/i.test(url))) throw new Error('LegalPages chunk not loaded on privacy route');
    if (privacyErrors.length) throw new Error(`privacy page errors: ${privacyErrors.join(' | ')}`);
    await privacy.close();

    const terms = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const termsPage = await terms.newPage();
    const termsErrors = [];
    termsPage.on('pageerror', e => termsErrors.push(String(e)));
    await termsPage.goto('http://127.0.0.1:4173/terms', { waitUntil: 'networkidle' });
    await termsPage.getByText('서비스 이용약관', { exact: true }).waitFor();
    await termsPage.getByText('제3자 오픈소스 소프트웨어', { exact: true }).waitFor();
    if (termsErrors.length) throw new Error(`terms page errors: ${termsErrors.join(' | ')}`);
    await terms.close();
  } finally {
    await browser.close();
  }
  console.log('LEGAL_BROWSER_SMOKE_OK');
} finally {
  preview.kill('SIGTERM');
}

run('git restore package.json package-lock.json || true', { shell: '/bin/bash' });
fs.rmSync('.github/workflows/temp-lazy-legal-pages.yml');
fs.rmSync('scripts/temp-lazy-legal-pages.mjs');
run('git diff --check');
run('git add src/App.jsx src/components/LegalPages.jsx vite.legal-notices.config.js .github/workflows/temp-lazy-legal-pages.yml scripts/temp-lazy-legal-pages.mjs');
const changed = execSync("git diff --cached origin/main --name-only | sort | tr '\\n' ' '", { encoding: 'utf8', shell: '/bin/bash' });
console.log(`FINAL_STAGED_FILES=${changed}`);
if (changed !== 'src/App.jsx src/components/LegalPages.jsx vite.legal-notices.config.js ') throw new Error(`unexpected final staged files: ${changed}`);
run('git config user.name "github-actions[bot]"', { shell: '/bin/bash' });
run('git config user.email "41898282+github-actions[bot]@users.noreply.github.com"', { shell: '/bin/bash' });
run('git commit -m "Lazy-load legal pages [skip ci]"', { shell: '/bin/bash' });
run('git push origin HEAD:perf/lazy-legal-pages', { shell: '/bin/bash' });
