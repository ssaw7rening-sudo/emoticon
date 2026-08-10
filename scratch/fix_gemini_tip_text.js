import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, '../src/App.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Update geminiFinalTip across languages
content = content.replace(
  "geminiFinalTip: 'Attach the saved base character image again and generate each final sticker with Batch Split.'",
  "geminiFinalTip: 'Gemini excels at expression and action generation. Use the sheet as a draft, then generate each sticker with Batch Split.'"
);

content = content.replace(
  "geminiFinalTip: '保存した基準キャラクター画像をGeminiに再度添付し、15種個別分割で1枚ずつ生成してください。'",
  "geminiFinalTip: 'Geminiは表情やポーズの表現が得意です。シート全体で試作後、15種個別分割で1枚ずつ生成するのがおすすめです。'"
);

content = content.replace(
  "geminiFinalTip: '将保存的基准角色图重新发送给Gemini，并使用单张拆分逐张生成。'",
  "geminiFinalTip: 'Gemini擅长生成丰富的表情与动作。建议将整页作为草稿，再使用单张拆分逐张生成。'"
);

// Unify Gemini button order to put ['text', t.geminiIncludeText] first
content = content.replace(
  "                  [\n                    ['visual', t.geminiNoText],\n                    ['text', t.geminiIncludeText],\n                  ]",
  "                  [\n                    ['text', t.geminiIncludeText],\n                    ['visual', t.geminiNoText],\n                  ]"
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated geminiFinalTip and unified Gemini button ordering!');
