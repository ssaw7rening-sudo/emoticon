import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, '../src/App.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Replace all rounded-3xl / rounded-[32px] / rounded-[28px] / rounded-[40px] with rounded-xl (12px) or rounded-2xl (16px)
content = content.replace(/rounded-\[40px\]/g, 'rounded-xl');
content = content.replace(/rounded-\[32px\]/g, 'rounded-xl');
content = content.replace(/rounded-\[28px\]/g, 'rounded-xl');
content = content.replace(/rounded-\[24px\]/g, 'rounded-xl');
content = content.replace(/rounded-\[18px\]/g, 'rounded-xl');
content = content.replace(/rounded-3xl/g, 'rounded-xl');

// Ensure outer box containers use rounded-xl (12px)
content = content.replace(
  'section className="relative overflow-hidden bg-gradient-to-br from-[#FFD3B6] via-[#FFE8B6] to-[#FFC2C2] text-[#5C3A21] p-4 sm:p-6 md:p-xl rounded-2xl',
  'section className="relative overflow-hidden bg-gradient-to-br from-[#FFD3B6] via-[#FFE8B6] to-[#FFC2C2] text-[#5C3A21] p-4 sm:p-6 md:p-xl rounded-xl'
);

content = content.replace(
  'p className="z-10 text-[13px] sm:text-[15px] md:text-[17px] leading-relaxed max-w-2xl mx-auto font-bold bg-white/40 p-3.5 sm:p-5 rounded-2xl',
  'p className="z-10 text-[13px] sm:text-[15px] md:text-[17px] leading-relaxed max-w-2xl mx-auto font-bold bg-white/40 p-3.5 sm:p-5 rounded-xl'
);

content = content.replace(
  'div className="bg-surface-container-lowest rounded-2xl p-3.5 sm:p-md shadow-bubbly border border-outline-variant"',
  'div className="bg-surface-container-lowest rounded-xl p-3.5 sm:p-md shadow-bubbly border border-outline-variant"'
);

content = content.replace(
  'div className="grid grid-cols-2 sm:grid-cols-3 gap-sm md:gap-md bg-surface-container-lowest rounded-2xl p-3.5 sm:p-md shadow-bubbly border border-outline-variant"',
  'div className="grid grid-cols-2 sm:grid-cols-3 gap-sm md:gap-md bg-surface-container-lowest rounded-xl p-3.5 sm:p-md shadow-bubbly border border-outline-variant"'
);

content = content.replace(
  'div className="bg-[#FFF7DF] rounded-2xl p-3 md:p-4 border border-[#F6D77A] shadow-sm flex flex-col gap-3"',
  'div className="bg-[#FFF7DF] rounded-xl p-3 md:p-4 border border-[#F6D77A] shadow-sm flex flex-col gap-3"'
);

content = content.replace(
  'div className="bg-[#FFF5E6] text-[#8C3D18] p-4 sm:p-5 md:p-6 rounded-2xl border border-[#FDE0B5] flex gap-3 md:gap-4 items-start shadow-sm mt-2 relative overflow-hidden"',
  'div className="bg-[#FFF5E6] text-[#8C3D18] p-4 sm:p-5 md:p-6 rounded-xl border border-[#FDE0B5] flex gap-3 md:gap-4 items-start shadow-sm mt-2 relative overflow-hidden"'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully set ALL box containers across App.jsx to crisp rounded-xl matching yellow box!');
