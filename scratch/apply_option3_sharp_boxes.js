import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, '../src/App.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace all box container radii classes to rounded-md (4px) or rounded-lg (4px)
content = content.replace(/rounded-3xl/g, 'rounded-md');
content = content.replace(/rounded-2xl/g, 'rounded-md');
content = content.replace(/rounded-xl/g, 'rounded-md');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully set all box containers to Option 3 sharp 4px border-radius!');
