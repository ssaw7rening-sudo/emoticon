import fs from 'node:fs';
import { execSync } from 'node:child_process';

const run = (command) => execSync(command, { stdio: 'inherit', shell: '/bin/bash' });
const appPath = 'src/App.jsx';
let app = fs.readFileSync(appPath, 'utf8');

const replacements = [
  [
`  const getDynamicPhraseFontSize = (str = '') => {
    const len = (str || '').trim().length;
    if (len <= 5) return 'text-[12px] sm:text-[13.5px] md:text-[14px] font-bold tracking-normal';
    if (len <= 8) return 'text-[11px] sm:text-[12.5px] md:text-[13px] font-bold tracking-tight';
    if (len <= 11) return 'text-[10.5px] sm:text-[11.5px] md:text-[12px] font-bold tracking-tight';
    if (len <= 14) return 'text-[10px] sm:text-[11px] md:text-[11.5px] font-bold tracking-tighter';
    return 'text-[9.5px] sm:text-[10.5px] md:text-[11px] font-extrabold tracking-tighter';
  };`,
`  const getDynamicPhraseFontSize = (str = '') => {
    const len = (str || '').trim().length;
    if (len <= 5) return 'text-[11.5px] sm:text-[13px] md:text-[13.5px] font-semibold tracking-normal';
    if (len <= 8) return 'text-[11.25px] sm:text-[12.5px] md:text-[13px] font-semibold tracking-tight';
    if (len <= 11) return 'text-[11px] sm:text-[12px] md:text-[12.5px] font-semibold tracking-tight';
    if (len <= 14) return 'text-[10.75px] sm:text-[11.5px] md:text-[12px] font-semibold tracking-tight';
    return 'text-[10.5px] sm:text-[11px] md:text-[11.5px] font-semibold tracking-tighter';
  };`
  ],
  [
    'text-[9.5px] sm:text-[10px] font-black text-[#2F7D68]',
    'text-[10.5px] sm:text-[11px] font-bold text-[#2F7D68]'
  ],
  [
    'text-[11px] sm:text-[11.5px] font-semibold text-mint-strong mb-0.5 uppercase tracking-wide',
    'text-[12.5px] sm:text-[13px] font-semibold text-mint-strong mb-0.5 tracking-normal'
  ],
  [
    'text-[16px] sm:text-[18px] font-bold text-[#133E32] tracking-tight',
    'text-[15.5px] sm:text-[17px] font-semibold text-[#133E32] tracking-tight'
  ],
  [
    'px-3 sm:px-3.5 text-[12px] sm:text-[13px] font-bold text-[#1E5D4B]',
    'px-3 sm:px-3.5 text-[12.5px] sm:text-[13.5px] font-semibold text-[#1E5D4B]'
  ],
  [
    'text-[11px] sm:text-[11.5px] font-extrabold text-[#8A6048]',
    'text-[12.5px] sm:text-[13px] font-semibold text-[#8A6048]'
  ],
  [
    "px-3 text-[12.5px] sm:text-[13px] font-bold shrink-0 whitespace-nowrap ${activeTheme === theme ? 'bg-[#FFF0E3] border-[#E9B88E] text-[#9A4B22] font-black' : 'bg-white border-[#E8D8CA] text-[#7A5A46]'}",
    "px-3 text-[12.5px] sm:text-[13.5px] font-semibold shrink-0 whitespace-nowrap ${activeTheme === theme ? 'bg-[#FFF0E3] border-[#E9B88E] text-[#9A4B22] font-bold' : 'bg-white border-[#E8D8CA] text-[#7A5A46]'}"
  ],
];

for (const [oldText, newText] of replacements) {
  const count = app.split(oldText).length - 1;
  if (count !== 1) throw new Error(`Expected exactly one UI typography anchor, found ${count}: ${oldText.slice(0, 80)}`);
  app = app.replace(oldText, newText);
}

fs.writeFileSync(appPath, app);
run('git diff --check');
run('npm ci');
run('npm run build');

const updated = fs.readFileSync(appPath, 'utf8');
if (!updated.includes("text-[10.5px] sm:text-[11px] md:text-[11.5px] font-semibold tracking-tighter")) throw new Error('long phrase minimum font update missing');
if (!updated.includes("text-[11.5px] sm:text-[13px] md:text-[13.5px] font-semibold tracking-normal")) throw new Error('short phrase scale update missing');
if (!updated.includes('text-[12.5px] sm:text-[13px] font-semibold text-mint-strong')) throw new Error('active-theme helper type update missing');
if (!updated.includes('text-[15.5px] sm:text-[17px] font-semibold text-[#133E32]')) throw new Error('active-theme title type update missing');

fs.rmSync('.github/workflows/temp-ui-type-scale.yml');
fs.rmSync('scripts/temp-ui-type-scale.mjs');
run('git add src/App.jsx src/components/ThemePickerModal.jsx .github/workflows/temp-ui-type-scale.yml scripts/temp-ui-type-scale.mjs');
const changed = execSync("git diff --cached origin/main --name-only | sort | tr '\n' ' '", { encoding: 'utf8', shell: '/bin/bash' });
console.log(`FINAL_STAGED_FILES=${changed}`);
if (changed !== 'src/App.jsx src/components/ThemePickerModal.jsx ') throw new Error(`Unexpected final staged files: ${changed}`);
run('git config user.name "github-actions[bot]"');
run('git config user.email "41898282+github-actions[bot]@users.noreply.github.com"');
run('git commit -m "Balance theme UI typography [skip ci]"');
run('git push origin HEAD:ui/type-scale-theme-harmony');
