import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = fileURLToPath(new URL('..', import.meta.url));
const viteBin = path.join(rootDir, 'node_modules', 'vite', 'bin', 'vite.js');

const steps = [
  ['Generate OG images', process.execPath, [path.join(rootDir, 'scripts', 'generate-og-images.mjs')]],
  ['Build Vite app', process.execPath, [viteBin, 'build', '--config', path.join(rootDir, 'vite.tailwind-motion-cleanup.config.js')]],
  ['Normalize service names', process.execPath, [path.join(rootDir, 'scripts', 'normalize-service-names.mjs')]],
  ['Generate localized pages', process.execPath, [path.join(rootDir, 'scripts', 'generate-localized-pages.mjs')]],
  ['Generate feature SEO pages', process.execPath, [path.join(rootDir, 'scripts', 'generate-feature-seo-pages.mjs')]],
  ['Add internal tool links', process.execPath, [path.join(rootDir, 'scripts', 'add-internal-tool-links.mjs')]],
  ['Finalize SEO', process.execPath, [path.join(rootDir, 'scripts', 'finalize-seo.mjs')]],
  ['Enhance global SEO', process.execPath, [path.join(rootDir, 'scripts', 'enhance-global-seo.mjs')]],
  ['Polish feature landing pages', process.execPath, [path.join(rootDir, 'scripts', 'polish-feature-landing-pages.mjs')]],
  ['Apply OG images', process.execPath, [path.join(rootDir, 'scripts', 'apply-og-images.mjs')]],
  ['Inject prompt template fallback', process.execPath, [path.join(rootDir, 'scripts', 'inject-prompt-template-fallback.mjs')]],
];

for (const [label, command, args] of steps) {
  console.log(`\n[build] ${label}`);
  const result = spawnSync(command, args, {
    cwd: rootDir,
    env: process.env,
    stdio: 'inherit',
  });

  if (result.error) {
    console.error(`[build] ${label} could not start:`, result.error);
    process.exit(1);
  }

  if (result.status !== 0) {
    console.error(`[build] ${label} failed with exit code ${result.status ?? 'unknown'}.`);
    process.exit(result.status || 1);
  }
}

console.log('\n[build] All build steps completed successfully.');
