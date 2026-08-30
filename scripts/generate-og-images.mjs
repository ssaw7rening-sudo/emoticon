import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const WIDTH = 1200;
const HEIGHT = 630;
const outDir = path.resolve('public/og');
fs.mkdirSync(outDir, { recursive: true });

const FONT = {
  A:['01110','10001','10001','11111','10001','10001','10001'], B:['11110','10001','10001','11110','10001','10001','11110'],
  C:['01111','10000','10000','10000','10000','10000','01111'], D:['11110','10001','10001','10001','10001','10001','11110'],
  E:['11111','10000','10000','11110','10000','10000','11111'], F:['11111','10000','10000','11110','10000','10000','10000'],
  G:['01111','10000','10000','10111','10001','10001','01111'], H:['10001','10001','10001','11111','10001','10001','10001'],
  I:['11111','00100','00100','00100','00100','00100','11111'], J:['00111','00010','00010','00010','10010','10010','01100'],
  K:['10001','10010','10100','11000','10100','10010','10001'], L:['10000','10000','10000','10000','10000','10000','11111'],
  M:['10001','11011','10101','10101','10001','10001','10001'], N:['10001','11001','10101','10011','10001','10001','10001'],
  O:['01110','10001','10001','10001','10001','10001','01110'], P:['11110','10001','10001','11110','10000','10000','10000'],
  Q:['01110','10001','10001','10001','10101','10010','01101'], R:['11110','10001','10001','11110','10100','10010','10001'],
  S:['01111','10000','10000','01110','00001','00001','11110'], T:['11111','00100','00100','00100','00100','00100','00100'],
  U:['10001','10001','10001','10001','10001','10001','01110'], V:['10001','10001','10001','10001','10001','01010','00100'],
  W:['10001','10001','10001','10101','10101','11011','10001'], X:['10001','10001','01010','00100','01010','10001','10001'],
  Y:['10001','10001','01010','00100','00100','00100','00100'], Z:['11111','00001','00010','00100','01000','10000','11111'],
  '0':['01110','10001','10011','10101','11001','10001','01110'], '1':['00100','01100','00100','00100','00100','00100','01110'],
  '2':['01110','10001','00001','00010','00100','01000','11111'], '3':['11110','00001','00001','01110','00001','00001','11110'],
  '4':['00010','00110','01010','10010','11111','00010','00010'], '5':['11111','10000','10000','11110','00001','00001','11110'],
  '6':['01110','10000','10000','11110','10001','10001','01110'], '7':['11111','00001','00010','00100','01000','01000','01000'],
  '8':['01110','10001','10001','01110','10001','10001','01110'], '9':['01110','10001','10001','01111','00001','00001','01110'],
  '-':['00000','00000','00000','11111','00000','00000','00000'], '&':['01100','10010','10100','01000','10101','10010','01101'],
  '/':['00001','00010','00100','01000','10000','00000','00000'], '.':['00000','00000','00000','00000','00000','00110','00110'],
  ' ':['00000','00000','00000','00000','00000','00000','00000']
};

const hex = (value) => {
  const clean = value.replace('#', '');
  return [parseInt(clean.slice(0,2),16), parseInt(clean.slice(2,4),16), parseInt(clean.slice(4,6),16), 255];
};

const canvas = () => Buffer.alloc(WIDTH * HEIGHT * 4);
const put = (buf, x, y, color) => {
  if (x < 0 || y < 0 || x >= WIDTH || y >= HEIGHT) return;
  const i = (y * WIDTH + x) * 4;
  buf[i] = color[0]; buf[i+1] = color[1]; buf[i+2] = color[2]; buf[i+3] = color[3] ?? 255;
};
const rect = (buf, x, y, w, h, color) => {
  const x0 = Math.max(0, Math.floor(x)); const y0 = Math.max(0, Math.floor(y));
  const x1 = Math.min(WIDTH, Math.ceil(x+w)); const y1 = Math.min(HEIGHT, Math.ceil(y+h));
  for (let yy=y0; yy<y1; yy++) for (let xx=x0; xx<x1; xx++) put(buf, xx, yy, color);
};
const circle = (buf, cx, cy, r, color) => {
  const rr = r*r;
  for (let y=Math.floor(cy-r); y<=Math.ceil(cy+r); y++) {
    for (let x=Math.floor(cx-r); x<=Math.ceil(cx+r); x++) {
      const dx=x-cx, dy=y-cy; if (dx*dx+dy*dy<=rr) put(buf,x,y,color);
    }
  }
};
const roundedRect = (buf, x, y, w, h, r, color) => {
  rect(buf,x+r,y,w-2*r,h,color); rect(buf,x,y+r,w,h-2*r,color);
  circle(buf,x+r,y+r,r,color); circle(buf,x+w-r-1,y+r,r,color); circle(buf,x+r,y+h-r-1,r,color); circle(buf,x+w-r-1,y+h-r-1,r,color);
};
const line = (buf, x0, y0, x1, y1, width, color) => {
  const steps = Math.max(Math.abs(x1-x0), Math.abs(y1-y0));
  for (let i=0;i<=steps;i++) { const t=steps ? i/steps : 0; circle(buf, Math.round(x0+(x1-x0)*t), Math.round(y0+(y1-y0)*t), Math.max(1,width/2), color); }
};

const measureText = (text, scale) => {
  const chars = [...text.toUpperCase()];
  return chars.reduce((sum) => sum + 6*scale, 0) - scale;
};
const drawText = (buf, text, x, y, scale, color, { center=false }={}) => {
  const upper = text.toUpperCase();
  let cx = center ? x - measureText(upper, scale)/2 : x;
  for (const ch of upper) {
    const glyph = FONT[ch] || FONT[' '];
    for (let row=0; row<7; row++) for (let col=0; col<5; col++) if (glyph[row][col]==='1') rect(buf,cx+col*scale,y+row*scale,scale,scale,color);
    cx += 6*scale;
  }
};

const checker = (buf, x, y, w, h, size, a, b) => {
  for (let yy=0; yy<h; yy+=size) for (let xx=0; xx<w; xx+=size) rect(buf,x+xx,y+yy,Math.min(size,w-xx),Math.min(size,h-yy),((xx/size+yy/size)%2===0)?a:b);
};

function iconFor(buf, key, x, y, accent, dark) {
  if (key === 'main' || key === 'ai-sticker-maker') {
    for (let row=0; row<3; row++) for (let col=0; col<5; col++) {
      const cx=x+55+col*58, cy=y+48+row*58;
      circle(buf,cx,cy,20,accent); circle(buf,cx-6,cy-3,3,dark); circle(buf,cx+6,cy-3,3,dark); line(buf,cx-7,cy+7,cx+7,cy+7,2,dark);
    }
    return;
  }
  if (key === 'photo-to-sticker') {
    roundedRect(buf,x+28,y+24,270,186,22,hex('#FFFFFF')); roundedRect(buf,x+44,y+40,238,154,14,hex('#F5E7C9'));
    circle(buf,x+104,y+94,28,accent); line(buf,x+67,y+168,x+138,y+120,10,dark); line(buf,x+132,y+123,x+192,y+165,10,dark); line(buf,x+188,y+165,x+244,y+110,10,dark);
    circle(buf,x+268,y+44,34,accent); drawText(buf,'+',x+268,y+22,5,dark,{center:true});
    return;
  }
  if (key === 'background-remover' || key === 'transparent-png-maker') {
    checker(buf,x+30,y+28,270,182,22,hex('#F3EFE8'),hex('#FFFFFF'));
    circle(buf,x+165,y+112,58,accent); roundedRect(buf,x+128,y+76,74,72,34,dark); circle(buf,x+146,y+101,5,accent); circle(buf,x+184,y+101,5,accent);
    line(buf,x+122,y+167,x+208,y+167,8,dark); line(buf,x+100,y+187,x+230,y+187,6,accent);
    return;
  }
  if (key === 'sticker-sheet-splitter') {
    const cw=48,ch=48,g=10;
    for(let r=0;r<3;r++) for(let c=0;c<5;c++){ const xx=x+30+c*(cw+g), yy=y+28+r*(ch+g); roundedRect(buf,xx,yy,cw,ch,10,(r+c)%2?hex('#FFFFFF'):accent); circle(buf,xx+24,yy+24,9,dark); }
    line(buf,x+4,y+95,x+326,y+95,4,dark); line(buf,x+4,y+153,x+326,y+153,4,dark);
    return;
  }
  if (key === 'image-upscaler') {
    roundedRect(buf,x+44,y+54,122,122,18,hex('#FFFFFF')); roundedRect(buf,x+174,y+20,132,132,18,accent);
    line(buf,x+132,y+118,x+226,y+72,8,dark); line(buf,x+226,y+72,x+205,y+70,8,dark); line(buf,x+226,y+72,x+218,y+92,8,dark);
    drawText(buf,'2X',x+106,y+98,5,dark,{center:true}); drawText(buf,'4X',x+240,y+64,5,dark,{center:true});
  }
}

const cards = [
  { key:'main', file:'main.png', title:['PROMPT MAKER'], sub:'AI STICKERS  BACKGROUND  PNG  ZIP', accent:'#F2C968' },
  { key:'ai-sticker-maker', file:'ai-sticker-maker.png', title:['AI STICKER','MAKER'], sub:'15 EXPRESSIONS  CHATGPT  GEMINI  GROK', accent:'#F2C968' },
  { key:'photo-to-sticker', file:'photo-to-sticker.png', title:['PHOTO TO','STICKER'], sub:'SELFIE  PET  CHARACTER  15 EXPRESSIONS', accent:'#F0A985' },
  { key:'background-remover', file:'background-remover.png', title:['BACKGROUND','REMOVER'], sub:'PRECISION CUTOUT  TRANSPARENT PNG', accent:'#BFD8B8' },
  { key:'sticker-sheet-splitter', file:'sticker-sheet-splitter.png', title:['15 STICKER','SPLITTER'], sub:'SMART DETECTION  EDIT  ZIP EXPORT', accent:'#B9D7EA' },
  { key:'transparent-png-maker', file:'transparent-png-maker.png', title:['TRANSPARENT','PNG MAKER'], sub:'PRESERVE RGB  REFINE EDGES  EXPORT PNG', accent:'#D6C8EA' },
  { key:'image-upscaler', file:'image-upscaler.png', title:['IMAGE','UPSCALER'], sub:'360  720  1440 PX  BATCH ZIP', accent:'#F5C7B2' }
];

let crcTable;
const crc32 = (buf) => {
  if (!crcTable) {
    crcTable = Array.from({length:256},(_,n)=>{ let c=n; for(let k=0;k<8;k++) c=(c&1)?0xEDB88320^(c>>>1):c>>>1; return c>>>0; });
  }
  let c=0xFFFFFFFF; for (const b of buf) c=crcTable[(c^b)&0xFF]^(c>>>8); return (c^0xFFFFFFFF)>>>0;
};
const chunk = (type, data) => {
  const t=Buffer.from(type); const len=Buffer.alloc(4); len.writeUInt32BE(data.length);
  const crc=Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t,data])));
  return Buffer.concat([len,t,data,crc]);
};
const encodePng = (pixels) => {
  const raw=Buffer.alloc((WIDTH*4+1)*HEIGHT);
  for(let y=0;y<HEIGHT;y++){ const row=y*(WIDTH*4+1); raw[row]=0; pixels.copy(raw,row+1,y*WIDTH*4,(y+1)*WIDTH*4); }
  const ihdr=Buffer.alloc(13); ihdr.writeUInt32BE(WIDTH,0); ihdr.writeUInt32BE(HEIGHT,4); ihdr[8]=8; ihdr[9]=6;
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ihdr),chunk('IDAT',zlib.deflateSync(raw,{level:9})),chunk('IEND',Buffer.alloc(0))]);
};

for (const card of cards) {
  const buf=canvas();
  const bg=hex('#FFF9EC'), panel=hex('#FFFDF8'), dark=hex('#4E3C28'), muted=hex('#8A755E'), accent=hex(card.accent), gold=hex('#D5A83D');
  rect(buf,0,0,WIDTH,HEIGHT,bg);
  for(let y=0;y<HEIGHT;y+=32) for(let x=(y/32)%2?16:0;x<WIDTH;x+=32) circle(buf,x,y,1,hex('#EEDFBF'));
  circle(buf,1090,70,150,hex('#FFF0C9')); circle(buf,1140,570,190,hex('#F6E7CC')); circle(buf,40,620,160,hex('#FFF1D6'));
  roundedRect(buf,58,48,1084,534,32,panel);
  roundedRect(buf,88,82,280,44,22,hex('#FFF1C9')); drawText(buf,'PROMPT MAKER',228,94,4,dark,{center:true});
  drawText(buf,'FREE WEB TOOL',1000,96,3,muted,{center:true});
  roundedRect(buf,104,168,350,250,30,hex('#FFF8EA')); iconFor(buf,card.key,116,178,accent,dark);
  let titleY = card.title.length===1 ? 208 : 176;
  for(const lineText of card.title){ drawText(buf,lineText,510,titleY,10,dark); titleY+=90; }
  roundedRect(buf,510,366,560,4,2,gold);
  drawText(buf,card.sub,510,404,4,muted);
  roundedRect(buf,510,478,270,48,24,hex('#FFF0BF')); drawText(buf,'CREATE  EDIT  EXPORT',645,491,3,dark,{center:true});
  drawText(buf,'PROMPTMAKER',1030,536,3,muted,{center:true});
  fs.writeFileSync(path.join(outDir,card.file),encodePng(buf));
}

console.log(`Generated ${cards.length} Open Graph PNG images (${WIDTH}x${HEIGHT}) in public/og`);
