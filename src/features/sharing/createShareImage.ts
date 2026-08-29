import { PixelRatio, Platform, type View } from 'react-native';

import {
  createShareFilename,
  getShareDimensions,
  getShareFontSize,
  getShareTemplate,
  SHARE_BRAND_WATERMARK,
  type ShareCardOptions,
  type ShareContent,
} from '@/features/sharing/shareTemplates';

export type GeneratedShareImage = {
  fileName: string;
  height: number;
  mimeType: 'image/png';
  uri: string;
  width: number;
};

export async function createShareImage(
  cardRef: View | null,
  content: ShareContent,
  options: ShareCardOptions,
): Promise<GeneratedShareImage> {
  if (Platform.OS === 'web') {
    return createWebShareImage(content, options);
  }
  if (!cardRef) throw new Error('SHARE_CARD_NOT_READY');

  const { captureRef } = await import('react-native-view-shot');
  const dimensions = getShareDimensions(options.aspect);
  const pixelRatio = PixelRatio.get();
  const uri = await captureRef(cardRef, {
    format: 'png',
    height: dimensions.height / pixelRatio,
    quality: 1,
    result: 'tmpfile',
    width: dimensions.width / pixelRatio,
  });

  return {
    ...dimensions,
    fileName: createShareFilename(content),
    mimeType: 'image/png',
    uri,
  };
}

async function createWebShareImage(
  content: ShareContent,
  options: ShareCardOptions,
): Promise<GeneratedShareImage> {
  if (typeof document === 'undefined') throw new Error('WEB_CANVAS_UNAVAILABLE');
  await document.fonts?.ready;

  const dimensions = getShareDimensions(options.aspect);
  const template = getShareTemplate(options.templateId);
  const canvas = document.createElement('canvas');
  canvas.width = dimensions.width;
  canvas.height = dimensions.height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('WEB_CANVAS_UNAVAILABLE');

  context.fillStyle = template.background;
  context.fillRect(0, 0, dimensions.width, dimensions.height);

  context.save();
  context.globalAlpha = options.templateId === 'parchment' ? 0.1 : 0.14;
  context.fillStyle = template.accent;
  context.beginPath();
  context.ellipse(
    dimensions.width * 0.92,
    dimensions.height * 0.04,
    dimensions.width * 0.34,
    dimensions.height * (options.aspect === 'story' ? 0.22 : 0.31),
    0,
    0,
    Math.PI * 2,
  );
  context.fill();
  context.restore();

  context.save();
  context.globalAlpha = options.templateId === 'clay' ? 0.34 : 0.22;
  context.strokeStyle = template.accent;
  context.lineWidth = 3;
  context.beginPath();
  context.ellipse(
    -dimensions.width * 0.04,
    dimensions.height * 1.04,
    dimensions.width * 0.36,
    dimensions.height * 0.22,
    0,
    0,
    Math.PI * 2,
  );
  context.stroke();
  context.restore();

  const margin = 78;
  const textWidth = dimensions.width - margin * 2;
  drawRoundedRectangle(context, margin, 72, 84, 84, 28, template.accent);
  context.fillStyle = template.onAccent;
  context.font = '600 57px "Cormorant Garamond", Georgia, serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText('A', margin + 42, 116);
  context.fillStyle = template.text;
  context.font = '700 31px Manrope, Arial, sans-serif';
  context.letterSpacing = '6px';
  context.textAlign = 'left';
  context.fillText('ALIENTA', margin + 116, 116);
  context.letterSpacing = '0px';

  const isStory = options.aspect === 'story';
  const contentTop = isStory ? 360 : 225;
  const contentBottom = isStory ? dimensions.height - 300 : dimensions.height - 205;
  const availableHeight = contentBottom - contentTop;
  const alignmentX = options.alignment === 'center' ? dimensions.width / 2 : margin;
  const canvasAlignment = options.alignment === 'center' ? 'center' : 'left';
  let bodySize = getShareFontSize(content.body.length, options.textSize, options.aspect) * 3;
  const titleSize = isStory ? 86 : 76;
  let bodyLines: string[] = [];
  let titleLines: string[] = [];
  let blockHeight = 0;

  while (bodySize >= 39) {
    context.font = `${content.kind === 'verse' ? '500' : '400'} ${bodySize}px ${
      content.kind === 'verse' ? '"Cormorant Garamond", Georgia, serif' : 'Manrope, Arial, sans-serif'
    }`;
    bodyLines = wrapCanvasText(context, content.body, textWidth);
    context.font = `600 ${titleSize}px "Cormorant Garamond", Georgia, serif`;
    titleLines = content.title ? wrapCanvasText(context, content.title, textWidth) : [];
    blockHeight =
      (content.kind === 'verse' ? 82 : 0) +
      titleLines.length * titleSize * 1.08 +
      (titleLines.length ? 36 : 0) +
      bodyLines.length * bodySize * 1.28 +
      128;
    if (blockHeight <= availableHeight) break;
    bodySize -= 3;
  }

  let cursorY = contentTop + Math.max((availableHeight - blockHeight) / 2, 0);
  context.textAlign = canvasAlignment;
  context.textBaseline = 'alphabetic';

  if (content.kind === 'verse') {
    context.fillStyle = template.accent;
    context.font = '500 italic 150px "Cormorant Garamond", Georgia, serif';
    context.fillText('“', alignmentX, cursorY + 92);
    cursorY += 82;
  }

  if (titleLines.length) {
    context.fillStyle = template.text;
    context.font = `600 ${titleSize}px "Cormorant Garamond", Georgia, serif`;
    cursorY = drawCanvasLines(context, titleLines, alignmentX, cursorY, titleSize * 1.08);
    cursorY += 36;
  }

  context.fillStyle = template.text;
  context.font = `${content.kind === 'verse' ? '500' : '400'} ${bodySize}px ${
    content.kind === 'verse' ? '"Cormorant Garamond", Georgia, serif' : 'Manrope, Arial, sans-serif'
  }`;
  cursorY = drawCanvasLines(context, bodyLines, alignmentX, cursorY, bodySize * 1.28);

  cursorY += 46;
  context.fillStyle = template.accent;
  const ruleX = options.alignment === 'center' ? dimensions.width / 2 - 63 : margin;
  context.fillRect(ruleX, cursorY, 126, 5);
  cursorY += 52;
  context.fillStyle = template.text;
  context.font = '700 29px Manrope, Arial, sans-serif';
  context.letterSpacing = '4px';
  context.fillText(content.reference.toUpperCase(), alignmentX, cursorY);
  context.letterSpacing = '0px';

  const footerY = dimensions.height - 82;
  context.fillStyle = template.muted;
  context.font = '400 23px Manrope, Arial, sans-serif';
  context.textAlign = 'left';
  const attributionLines = wrapCanvasText(context, content.attribution, dimensions.width * 0.62);
  drawCanvasLines(context, attributionLines.slice(0, 2), margin, footerY - 30, 30);
  context.font = '600 23px Manrope, Arial, sans-serif';
  context.textAlign = 'right';
  context.fillText(SHARE_BRAND_WATERMARK, dimensions.width - margin, footerY);

  return {
    ...dimensions,
    fileName: createShareFilename(content),
    mimeType: 'image/png',
    uri: canvas.toDataURL('image/png'),
  };
}

function wrapCanvasText(context: CanvasRenderingContext2D, text: string, maximumWidth: number) {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    if (currentLine && context.measureText(candidate).width > maximumWidth) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = candidate;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

function drawCanvasLines(
  context: CanvasRenderingContext2D,
  lines: readonly string[],
  x: number,
  startY: number,
  lineHeight: number,
) {
  let y = startY;
  for (const line of lines) {
    y += lineHeight;
    context.fillText(line, x, y);
  }
  return y;
}

function drawRoundedRectangle(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  color: string,
) {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
  context.fillStyle = color;
  context.fill();
}
