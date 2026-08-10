import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, '../src/App.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace any remaining non-standard box radii with rounded-2xl
content = content.replace(/rounded-\[32px\]/g, 'rounded-2xl');
content = content.replace(/rounded-\[28px\]/g, 'rounded-2xl');
content = content.replace(/rounded-\[24px\]/g, 'rounded-2xl');
content = content.replace(/rounded-\[18px\]/g, 'rounded-2xl');

// Specifically update photo method box containers to rounded-2xl
content = content.replace(
  'div className="rounded-[8px] border border-mint-border bg-mint-soft p-3 flex flex-col gap-3"',
  'div className="rounded-2xl border border-mint-border bg-mint-soft p-3 flex flex-col gap-3"'
);
content = content.replace(
  'div className="rounded-[8px] border border-[#F6D77A] bg-[#FFF7DF] p-3 flex flex-col gap-3"',
  'div className="rounded-2xl border border-[#F6D77A] bg-[#FFF7DF] p-3 flex flex-col gap-3"'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully unified ALL box container radii to rounded-2xl!');
