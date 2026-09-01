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
console.log('PARTNERSHIP_BASELINE', JSON.stringify(baseline));

const appPath = 'src/App.jsx';
let app = fs.readFileSync(appPath, 'utf8');
const marker = '      {/* Partnership & Sponsor Banner Advertising Modal */}';
const rootEnd = '\n\n    </div>\n  );\n}\n\nexport default App;';
const start = app.indexOf(marker);
const end = app.indexOf(rootEnd, start);
if (start < 0 || end < 0) throw new Error('partnership modal boundaries not found');
const modalBlock = app.slice(start, end);
if ((modalBlock.match(/showPartnershipModal/g) || []).length !== 1) throw new Error('unexpected partnership modal block shape');
if (!modalBlock.includes("trackEvent('click_partnership_form', { lang });")) throw new Error('partnership tracking anchor missing');

const conditionalStart = '      {showPartnershipModal && (\n';
const conditionalEnd = '\n      )}';
if (!modalBlock.startsWith(`${marker}\n${conditionalStart}`) || !modalBlock.endsWith(conditionalEnd)) {
  throw new Error('partnership conditional wrapper mismatch');
}
let modalJsx = modalBlock.slice((`${marker}\n${conditionalStart}`).length, modalBlock.length - conditionalEnd.length);
modalJsx = modalJsx.replaceAll('onClick={() => setShowPartnershipModal(false)}', 'onClick={onClose}');
const inquiryClick = `onClick={() => {\n                  trackEvent('click_partnership_form', { lang });\n                  setShowPartnershipModal(false);\n                }}`;
if (!modalJsx.includes(inquiryClick)) throw new Error('inquiry click handler anchor missing');
modalJsx = modalJsx.replace(inquiryClick, 'onClick={onInquire}');
if (modalJsx.includes('setShowPartnershipModal') || modalJsx.includes("trackEvent('click_partnership_form'")) {
  throw new Error('App-specific modal handlers remain in extracted JSX');
}
const modalFile = `import React from 'react';\n\nexport default function PartnershipModal({ lang, onClose, onInquire }) {\n  return (\n${modalJsx}\n  );\n}\n`;
fs.writeFileSync('src/components/PartnershipModal.jsx', modalFile);

const importAnchor = 'const LegalPages = React.lazy(() => import("./components/LegalPages.jsx"));';
if (app.split(importAnchor).length !== 2) throw new Error('lazy import anchor count mismatch');
const lazyImport = 'const PartnershipModal = React.lazy(() => import("./components/PartnershipModal.jsx"));';
app = app.replace(importAnchor, `${importAnchor}\n${lazyImport}`);

const replacement = `      {/* Partnership & Sponsor Banner Advertising Modal */}\n      {showPartnershipModal && (\n        <React.Suspense fallback={null}>\n          <PartnershipModal\n            lang={lang}\n            onClose={() => setShowPartnershipModal(false)}\n            onInquire={() => {\n              trackEvent('click_partnership_form', { lang });\n              setShowPartnershipModal(false);\n            }}\n          />\n        </React.Suspense>\n      )}`;
app = app.slice(0, start) + replacement + app.slice(end);
if (app.split(lazyImport).length !== 2) throw new Error('PartnershipModal lazy import count mismatch');
if (app.split('<PartnershipModal').length !== 2) throw new Error('PartnershipModal JSX count mismatch');
fs.writeFileSync(appPath, app);
run('git diff --check');

run('npm run build');
const optimized = readEntry();
const savings = baseline.size - optimized.size;
const pct = Number(((savings / baseline.size) * 100).toFixed(2));
const assets = fs.readdirSync('dist/assets');
const modalChunks = assets.filter(name => /^PartnershipModal-/i.test(name));
console.log('PARTNERSHIP_OPTIMIZED', JSON.stringify({ ...optimized, baselineSize: baseline.size, savings, pct, modalChunks }));
if (savings < 1500) throw new Error(`partnership lazy-load savings too small: ${savings}`);
if (modalChunks.length !== 1) throw new Error(`expected one PartnershipModal chunk, got ${modalChunks.length}`);

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
    if (scripts.some(url => /PartnershipModal-/i.test(url))) throw new Error('PartnershipModal loaded on initial main route');
    await page.getByRole('button', { name: '광고 및 제휴 문의' }).click();
    await page.getByText('광고 배너 게재 및 제휴 안내', { exact: true }).waitFor();
    if (!scripts.some(url => /PartnershipModal-/i.test(url))) throw new Error('PartnershipModal chunk did not load after opening');
    if (errors.length) throw new Error(`main page errors: ${errors.join(' | ')}`);
    await page.getByRole('button', { name: '닫기' }).click();
    await page.getByText('광고 배너 게재 및 제휴 안내', { exact: true }).waitFor({ state: 'hidden' });
    await context.close();
  } finally {
    await browser.close();
  }
  console.log('PARTNERSHIP_BROWSER_SMOKE_OK');
} finally {
  preview.kill('SIGTERM');
}

run('git restore package.json package-lock.json || true', { shell: '/bin/bash' });
fs.rmSync('.github/workflows/temp-lazy-partnership-modal.yml');
fs.rmSync('scripts/temp-lazy-partnership-modal.mjs');
run('git diff --check');
run('git add src/App.jsx src/components/PartnershipModal.jsx .github/workflows/temp-lazy-partnership-modal.yml scripts/temp-lazy-partnership-modal.mjs');
const changed = execSync("git diff --cached origin/main --name-only | sort | tr '\n' ' '", { encoding: 'utf8', shell: '/bin/bash' });
console.log(`FINAL_STAGED_FILES=${changed}`);
if (changed !== 'src/App.jsx src/components/PartnershipModal.jsx ') throw new Error(`unexpected final staged files: ${changed}`);
run('git config user.name "github-actions[bot]"', { shell: '/bin/bash' });
run('git config user.email "41898282+github-actions[bot]@users.noreply.github.com"', { shell: '/bin/bash' });
run('git commit -m "Lazy-load partnership modal [skip ci]"', { shell: '/bin/bash' });
run('git push origin HEAD:perf/lazy-partnership-modal', { shell: '/bin/bash' });
