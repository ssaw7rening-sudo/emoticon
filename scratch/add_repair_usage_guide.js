import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, '../src/App.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add repairHelp in I18N dictionary for ko, en, ja, zh
content = content.replace(
  "geminiRepairTitle: '결과 보정 프롬프트',",
  "geminiRepairTitle: '결과 보정 프롬프트',\n    repairHelp: '💡 사용법: AI가 만든 이미지에 결함이 생겼을 때 버튼을 눌러 복사한 뒤, AI 대화창에 그대로 붙여넣어(Ctrl+V) 전송하세요.',"
);

content = content.replace(
  "geminiRepairTitle: 'Result correction prompts',",
  "geminiRepairTitle: 'Result correction prompts',\n    repairHelp: '💡 How to use: Click a button to copy the prompt, then paste (Ctrl+V) into the active AI chat to fix defects.',"
);

content = content.replace(
  "geminiRepairTitle: '結果補正プロンプト',",
  "geminiRepairTitle: '結果補正プロンプト',\n    repairHelp: '💡 使い方: AIが生成した画像に問題がある場合、ボタンを押してコピーし、AIチャットに貼り付けて(Ctrl+V)送信してください。',"
);

content = content.replace(
  "geminiRepairTitle: '结果修正提示词',",
  "geminiRepairTitle: '结果修正提示词',\n    repairHelp: '💡 使用方法：若AI生成图出现瑕疵，点击复制修正提示词并粘贴发送至同一AI对话框(Ctrl+V)即可修复。',"
);

// 2. Render repairHelp right above the buttons in ChatGPT and Gemini boxes
const targetGptRepairBox = `<div className="flex flex-col gap-2 border-t border-[#E9DFC5] pt-3">
                <span className="text-[13px] font-bold text-[#795B16]">{t.geminiRepairTitle}</span>`;

const replacementGptRepairBox = `<div className="flex flex-col gap-2 border-t border-[#E9DFC5] pt-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-[13px] font-bold text-[#795B16]">{t.geminiRepairTitle}</span>
                  <span className="text-[12px] font-medium text-[#8A661C]">{t.repairHelp}</span>
                </div>`;

content = content.replaceAll(targetGptRepairBox, replacementGptRepairBox);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully added repairHelp text to I18N and UI option boxes!');
