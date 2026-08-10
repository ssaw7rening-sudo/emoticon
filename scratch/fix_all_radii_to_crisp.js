import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, '../src/App.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Replace all rounded-2xl on outer main containers with crisp rounded-xl
content = content.replace(/rounded-2xl/g, 'rounded-xl');

// 2. Change inner boxes, textareas, and notice boxes to crisp rounded-lg or rounded-md
content = content.replace(
  'p-3.5 sm:p-5 rounded-xl backdrop-blur-md',
  'p-3.5 sm:p-5 rounded-lg backdrop-blur-md'
);

content = content.replace(
  'textarea \n              className="w-full bg-white border-2 border-mint-border rounded-xl',
  'textarea \n              className="w-full bg-white border-2 border-mint-border rounded-lg'
);

content = content.replace(
  'div className="mt-3 bg-mint-soft border border-mint-border rounded-xl',
  'div className="mt-3 bg-mint-soft border border-mint-border rounded-lg'
);

content = content.replace(
  'div className="rounded-xl border border-mint-border bg-mint-soft p-3 flex flex-col gap-3"',
  'div className="rounded-lg border border-mint-border bg-mint-soft p-3 flex flex-col gap-3"'
);

content = content.replace(
  'div className="rounded-xl border border-[#F6D77A] bg-[#FFF7DF] p-3 flex flex-col gap-3"',
  'div className="rounded-lg border border-[#F6D77A] bg-[#FFF7DF] p-3 flex flex-col gap-3"'
);

content = content.replace(
  'div className="bg-[#FFF5E6] text-[#8C3D18] p-4 sm:p-5 md:p-6 rounded-xl',
  'div className="bg-[#FFF5E6] text-[#8C3D18] p-4 sm:p-5 md:p-6 rounded-lg'
);

content = content.replace(
  'div className="bg-white/60 rounded-xl',
  'div className="bg-white/60 rounded-lg'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully flattened all box container radii to crisp rounded-xl / rounded-lg!');
