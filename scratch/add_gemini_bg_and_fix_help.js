import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, '../src/App.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Add repairHelp in I18N dictionary for ko, en, ja, zh
if (!content.includes('repairHelp:')) {
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
}

// Add repairHelp text into both ChatGPT and Gemini option boxes
content = content.replace(
  '<span className="text-[13px] font-bold text-[#795B16]">{t.geminiRepairTitle}</span>',
  '<div className="flex flex-col gap-0.5"><span className="text-[13px] font-bold text-[#795B16]">{t.geminiRepairTitle}</span><span className="text-[12px] font-medium text-[#8A661C] leading-snug">{t.repairHelp}</span></div>'
);
content = content.replace(
  '<span className="text-[13px] font-bold text-[#795B16]">{t.geminiRepairTitle}</span>',
  '<div className="flex flex-col gap-0.5"><span className="text-[13px] font-bold text-[#795B16]">{t.geminiRepairTitle}</span><span className="text-[12px] font-medium text-[#8A661C] leading-snug">{t.repairHelp}</span></div>'
);

// Add Background selection box to Gemini previewMode === 'gemini' box
const targetGeminiTextModeHeader = `<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span className="text-[13px] font-bold text-[#795B16]">{t.geminiTextMode}</span>`;

const replacementGeminiTextModeWithBg = `<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span className="text-[13px] font-bold text-[#795B16]">{t.gptBackgroundMode}</span>
                <div className="grid grid-cols-3 gap-1 sm:gap-2 w-full sm:w-auto" role="group" aria-label={t.gptBackgroundMode}>
                  {[
                    ['transparent', t.gptTransparent],
                    ['solid', t.gptSolid],
                    ['chroma', t.gptChroma],
                  ].map(([mode, label]) => (
                    <button
                      key={mode}
                      type="button"
                      aria-pressed={gptBackgroundMode === mode}
                      onClick={() => setGptBackgroundMode(mode)}
                      className={\`interactive-control min-h-10 rounded-[8px] border px-1 sm:px-2 py-2 text-[11px] xs:text-[12px] sm:text-[13px] font-bold text-center text-ellipsis overflow-hidden whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C66A] \${
                        gptBackgroundMode === mode
                          ? 'bg-[#FFE8B5] text-[#5A461B] border-[#E8C66A] shadow-sm'
                          : 'bg-white text-on-surface border-[#E9DFC5] hover:bg-[#FFF3D8]'
                      }\`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              ${targetGeminiTextModeHeader}`;

if (!content.includes('aria-label={t.gptBackgroundMode}') || content.split('aria-label={t.gptBackgroundMode}').length < 3) {
  content = content.replace(targetGeminiTextModeHeader, replacementGeminiTextModeWithBg);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated App.jsx with Gemini background options and repairHelp text!');
