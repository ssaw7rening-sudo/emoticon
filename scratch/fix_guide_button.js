import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, '../src/App.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const oldText = `            <span className="xs:hidden">{lang === 'ko' ? '가이드' : 'Guide'}</span>\r\n            <span className="hidden xs:inline sm:hidden">{lang === 'ko' ? '활용' : 'Guide'}</span>\r\n            <span className="hidden sm:inline">{lang === 'ko' ? '활용 가이드' : 'Guide'}</span>`;

const newText = `            <span>{lang === 'ko' ? '활용 가이드' : lang === 'ja' ? 'ガイド' : lang === 'zh' ? '指南' : 'Guide'}</span>`;

if (content.includes(oldText)) {
  content = content.replace(oldText, newText);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully fixed duplicate Guide Guide text!');
} else {
  // Try without \r\n
  const oldText2 = `            <span className="xs:hidden">{lang === 'ko' ? '가이드' : 'Guide'}</span>\n            <span className="hidden xs:inline sm:hidden">{lang === 'ko' ? '활용' : 'Guide'}</span>\n            <span className="hidden sm:inline">{lang === 'ko' ? '활용 가이드' : 'Guide'}</span>`;
  if (content.includes(oldText2)) {
    content = content.replace(oldText2, newText);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Successfully fixed duplicate Guide Guide text (LF)!');
  } else {
    console.error('Could not find target text');
  }
}
