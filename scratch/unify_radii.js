import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, '../src/App.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Fix outer wrapper overflow-x-hidden breaking sticky header
content = content.replace(
  'div className="font-body-md text-body-md antialiased pb-32 overflow-x-hidden max-w-full w-full"',
  'div className="font-body-md text-body-md antialiased pb-32 max-w-full w-full"'
);

// 2. Fix Header sticky position and styling
content = content.replace(
  'header className="w-full top-0 bg-background flex items-center justify-between px-2.5 sm:px-gutter min-h-14 py-2 max-w-7xl mx-auto z-40 sticky shadow-sm md:shadow-none overflow-hidden"',
  'header className="w-full top-0 bg-background/95 backdrop-blur-md flex items-center justify-between px-3 sm:px-gutter min-h-14 py-2 max-w-7xl mx-auto z-50 sticky border-b border-outline-variant/30 shadow-xs overflow-hidden"'
);

// 3. Replace all container box high/inconsistent curvature classes with unified rounded-2xl
content = content.replace(/rounded-\[28px\]\s+sm:rounded-\[32px\]\s+md:rounded-\[40px\]/g, 'rounded-2xl');
content = content.replace(/rounded-xl\s+sm:rounded-2xl\s+md:rounded-3xl/g, 'rounded-2xl');
content = content.replace(/rounded-xl\s+sm:rounded-2xl/g, 'rounded-2xl');
content = content.replace(/rounded-lg\s+sm:rounded-xl/g, 'rounded-2xl');
content = content.replace(/rounded-3xl/g, 'rounded-2xl');
content = content.replace(/rounded-\[24px\]/g, 'rounded-2xl');
content = content.replace(/rounded-\[18px\]/g, 'rounded-2xl');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated App.jsx with unified rounded-2xl and sticky header!');
