from pathlib import Path

path = Path('src/components/BackgroundRemover.jsx')
s = path.read_text(encoding='utf-8')
old = r'''  const mask = await RawImage.fromTensor(tensor[0].sigmoid().mul(255).to('uint8'))
    .resize(rawImage.width, rawImage.height);
  const maskCanvas = mask.toCanvas();
  const { canvas, ctx } = await drawFileToCanvas(file);
  ctx.save();
  ctx.globalCompositeOperation = 'destination-in';
  ctx.drawImage(maskCanvas, 0, 0, canvas.width, canvas.height);
  ctx.restore();
  return canvasToPngBlob(canvas);
'''
new = r'''  const mask = await RawImage.fromTensor(tensor[0].sigmoid().mul(255).to('uint8'))
    .resize(rawImage.width, rawImage.height);
  const { canvas, ctx } = await drawFileToCanvas(file);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;
  const maskData = mask.data;
  const maskChannels = Math.max(1, mask.channels || 1);
  const total = canvas.width * canvas.height;
  if (!maskData || mask.width !== canvas.width || mask.height !== canvas.height) {
    throw new Error('BiRefNet mask size mismatch');
  }
  for (let i = 0; i < total; i += 1) {
    const alpha = maskData[i * maskChannels];
    pixels[i * 4 + 3] = Math.round((pixels[i * 4 + 3] * alpha) / 255);
  }
  ctx.putImageData(imageData, 0, 0);
  return canvasToPngBlob(canvas);
'''
if old not in s:
    raise SystemExit('Missing BiRefNet compose anchor')
s = s.replace(old, new, 1)
path.write_text(s, encoding='utf-8')
print('fixed BiRefNet mask composition')
