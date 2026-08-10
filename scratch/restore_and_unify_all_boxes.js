import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, '../src/App.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Hero section outer box & inner desc box
content = content.replace(
  'section className="relative overflow-hidden bg-gradient-to-br from-[#FFD3B6] via-[#FFE8B6] to-[#FFC2C2] text-[#5C3A21] p-4 sm:p-6 md:p-xl rounded-xl shadow-bubbly text-center flex flex-col items-center justify-center gap-3 sm:gap-4 md:gap-6 border-2 sm:border-4 border-white max-w-full w-full"',
  'section className="relative overflow-hidden bg-gradient-to-br from-[#FFD3B6] via-[#FFE8B6] to-[#FFC2C2] text-[#5C3A21] p-4 sm:p-6 md:p-xl rounded-3xl shadow-bubbly text-center flex flex-col items-center justify-center gap-3 sm:gap-4 md:gap-6 border-2 sm:border-4 border-white max-w-full w-full"'
);
content = content.replace(
  'p className="z-10 text-[13px] sm:text-[15px] md:text-[17px] leading-relaxed max-w-2xl mx-auto font-bold bg-white/40 p-3.5 sm:p-5 rounded-lg backdrop-blur-md border border-white/60 shadow-sm whitespace-pre-wrap [word-break:break-word] [overflow-wrap:anywhere] w-full"',
  'p className="z-10 text-[13px] sm:text-[15px] md:text-[17px] leading-relaxed max-w-2xl mx-auto font-bold bg-white/40 p-3.5 sm:p-5 rounded-2xl backdrop-blur-md border border-white/60 shadow-sm whitespace-pre-wrap [word-break:break-word] [overflow-wrap:anywhere] w-full"'
);

// Section 1 Outer Box & Inner Textarea & Notice Box & Tag Wrapper
content = content.replace(
  'div className="bg-surface-container-lowest rounded-xl p-3.5 sm:p-md shadow-bubbly border border-outline-variant"',
  'div className="bg-surface-container-lowest rounded-3xl p-3.5 sm:p-md shadow-bubbly border border-outline-variant"'
);
content = content.replace(
  'className="w-full bg-white border-2 border-mint-border rounded-lg p-3.5 sm:p-4 text-on-surface font-bold placeholder:text-on-surface-variant focus:outline-none focus:ring-4 focus:ring-mint focus:border-mint-border resize-y min-h-[100px] shadow-sm"',
  'className="w-full bg-white border-2 border-mint-border rounded-2xl p-3.5 sm:p-4 text-on-surface font-bold placeholder:text-on-surface-variant focus:outline-none focus:ring-4 focus:ring-mint focus:border-mint-border resize-y min-h-[100px] shadow-sm"'
);
content = content.replace(
  'div className="mt-3 bg-mint-soft border border-mint-border rounded-lg p-3 sm:p-3.5 flex items-start gap-2.5 text-[13px] text-mint-strong"',
  'div className="mt-3 bg-mint-soft border border-mint-border rounded-2xl p-3 sm:p-3.5 flex items-start gap-2.5 text-[13px] text-mint-strong"'
);
content = content.replace(
  'div className="mt-md bg-surface-container-highest rounded-lg overflow-hidden"',
  'div className="mt-md bg-surface-container-highest rounded-2xl overflow-hidden"'
);

// Section 2 & 3 Outer Boxes & Inner Fields
content = content.replace(
  'div className="grid grid-cols-2 sm:grid-cols-3 gap-sm md:gap-md bg-surface-container-lowest rounded-xl p-3.5 sm:p-md shadow-bubbly border border-outline-variant"',
  'div className="grid grid-cols-2 sm:grid-cols-3 gap-sm md:gap-md bg-surface-container-lowest rounded-3xl p-3.5 sm:p-md shadow-bubbly border border-outline-variant"'
);
content = content.replace(
  'div className="bg-[#FFF7DF] rounded-xl p-3 md:p-4 border border-[#F6D77A] shadow-sm flex flex-col gap-3"',
  'div className="bg-[#FFF7DF] rounded-3xl p-3 md:p-4 border border-[#F6D77A] shadow-sm flex flex-col gap-3"'
);

// Section 4 Output Box & Textarea & Copy Buttons
content = content.replace(
  'textarea \n              className="w-full bg-white border-2 border-outline-variant rounded-xl p-4 text-on-surface font-normal focus:outline-none resize-y min-h-[200px] shadow-sm"',
  'textarea \n              className="w-full bg-white border-2 border-outline-variant rounded-2xl p-4 text-on-surface font-normal focus:outline-none resize-y min-h-[200px] shadow-sm"'
);

// Super Tip Outer Box & Inner Specs Box
content = content.replace(
  'div className="bg-[#FFF5E6] text-[#8C3D18] p-4 sm:p-5 md:p-6 rounded-lg border border-[#FDE0B5] flex gap-3 md:gap-4 items-start shadow-sm mt-2 relative overflow-hidden"',
  'div className="bg-[#FFF5E6] text-[#8C3D18] p-4 sm:p-5 md:p-6 rounded-3xl border border-[#FDE0B5] flex gap-3 md:gap-4 items-start shadow-sm mt-2 relative overflow-hidden"'
);
content = content.replace(
  'div className="bg-white/60 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-[#FCD3A1]/60 shadow-sm flex flex-col gap-1.5 sm:gap-2 w-full"',
  'div className="bg-white/60 rounded-2xl p-3 sm:p-4 border border-[#FCD3A1]/60 shadow-sm flex flex-col gap-1.5 sm:gap-2 w-full"'
);

// InfoSection Outer Container
content = content.replace(
  'div className="bg-surface-container-lowest rounded-xl p-3.5 sm:p-md shadow-bubbly border border-outline-variant"',
  'div className="bg-surface-container-lowest rounded-3xl p-3.5 sm:p-md shadow-bubbly border border-outline-variant"'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully set all box containers to smooth rounded-3xl and rounded-2xl!');
