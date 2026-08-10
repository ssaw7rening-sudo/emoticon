import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, '../src/App.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Fix typo: 指示出し가 → 指示出しが
content = content.replace('指示出し가', '指示出しが');

// 2. Fix hero title: remove [word-break:break-word] and use word-break:keep-all for CJK
content = content.replace(
  '[word-break:break-word] [overflow-wrap:anywhere] w-full max-w-full px-1">',
  'w-full max-w-full px-1 [word-break:keep-all]">'
);

// 3. Fix hero description: same issue
content = content.replace(
  'whitespace-pre-wrap [word-break:break-word] [overflow-wrap:anywhere] w-full">',
  'whitespace-pre-wrap [word-break:keep-all] w-full">'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed Japanese typo and hero text word-break for CJK!');
