import fs from 'node:fs';

const path = 'src/components/BackgroundRemover.jsx';
let text = fs.readFileSync(path, 'utf8');

const importLine = "import React, { useEffect, useRef, useState } from 'react';";
if (!text.includes("import EmoticonPostProcessor")) {
  text = text.replace(importLine, `${importLine}\nimport EmoticonPostProcessor from './EmoticonPostProcessor';`);
}

const copyReplacements = [
  ["compareHint: '가운데 슬라이더를 좌우로 움직여 원본과 결과를 비교하세요.',", "compareHint: '가운데 슬라이더를 좌우로 움직여 원본과 결과를 비교하세요.',\n    transparentAlready: '이미 투명 배경인 PNG는 배경 제거 대상이 아닙니다. 배경이 있는 PNG·JPG·WEBP 이미지를 사용해 주세요.',"],
  ["compareHint: 'Drag the center slider left or right to compare the original and result.',", "compareHint: 'Drag the center slider left or right to compare the original and result.',\n    transparentAlready: 'A PNG that already has transparency does not need background removal. Please use a PNG, JPG, or WEBP with a background.',"],
  ["compareHint: '中央のスライダーを左右に動かして元画像と結果を比較できます。',", "compareHint: '中央のスライダーを左右に動かして元画像と結果を比較できます。',\n    transparentAlready: 'すでに透過背景のPNGは背景削除の対象ではありません。背景のあるPNG・JPG・WEBPをご利用ください。',"],
  ["compareHint: '左右拖动中间滑块即可对比原图和处理结果。',", "compareHint: '左右拖动中间滑块即可对比原图和处理结果。',\n    transparentAlready: '已经带透明背景的PNG无需再次移除背景。请使用带背景的PNG、JPG或WEBP图片。',"]
];

for (const [oldText, newText] of copyReplacements) {
  if (text.includes(oldText) && !text.slice(text.indexOf(oldText), text.indexOf(oldText) + 320).includes('transparentAlready')) {
    text = text.replace(oldText, newText);
  }
}

const componentMarker = "export default function BackgroundRemover({ lang = 'ko' }) {";
if (!text.includes('async function hasRealTransparency')) {
  const helper = `async function hasRealTransparency(file) {
  if (file?.type !== 'image/png') return false;
  const { canvas, ctx } = await drawFileToCanvas(file);
  const { width, height } = canvas;
  if (!width || !height) return false;
  const pixels = ctx.getImageData(0, 0, width, height).data;
  const step = Math.max(1, Math.floor(Math.sqrt((width * height) / 300000)));
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      if (pixels[(y * width + x) * 4 + 3] < 250) return true;
    }
  }
  return false;
}

`;
  text = text.replace(componentMarker, helper + componentMarker);
}

text = text.replace('const selectFile = (nextFile) => {', 'const selectFile = async (nextFile) => {');

if (!text.includes('setError(t.transparentAlready)')) {
  const sizeBlock = `    if (nextFile.size > 12 * 1024 * 1024) {
      setError(t.tooLarge);
      return;
    }
`;
  if (!text.includes(sizeBlock)) throw new Error('Could not find size validation block');
  const transparentBlock = `${sizeBlock}    if (nextFile.type === 'image/png') {
      try {
        if (await hasRealTransparency(nextFile)) {
          setError(t.transparentAlready);
          return;
        }
      } catch (e) {
        console.warn('Transparent PNG detection failed:', e);
      }
    }
`;
  text = text.replace(sizeBlock, transparentBlock);
}

const gridStart = '                  <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5 sm:gap-2.5">';
if (text.includes(gridStart)) {
  const start = text.indexOf(gridStart);
  const endMarker = '                </>\n              )}';
  const end = text.indexOf(endMarker, start);
  if (end < 0) throw new Error('Could not find split preview end');
  const replacement = `                  <EmoticonPostProcessor
                    items={splitItems}
                    sourceName={file?.name || 'emoticon'}
                    lang={lang}
                  />
`;
  text = text.slice(0, start) + replacement + text.slice(end);
}

fs.writeFileSync(path, text, 'utf8');
console.log('Patched BackgroundRemover.jsx');
