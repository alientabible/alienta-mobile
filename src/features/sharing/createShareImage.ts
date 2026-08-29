import { PixelRatio, Platform, type View } from 'react-native';

import {
  createShareFilename,
  getShareDimensions,
  getShareTemplate,
  getShareTypography,
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
  const measuredLength = content.body.length + (content.title?.length ?? 0) * 2;
  const typography = getShareTypography(measuredLength, options.textSize, options.aspect);
  const contentTop = isStory ? 250 : 190;
  const footerTop = dimensions.height - (isStory ? 150 : 135);
  const referenceBaseline = footerTop - (isStory ? 105 : 92);
  const referenceRuleY = referenceBaseline - 54;
  const bodyBottom = referenceRuleY - 42;
  const availableBodyHeight = bodyBottom - contentTop;
  const alignmentX = options.alignment === 'center' ? dimensions.width / 2 : margin;
  const canvasAlignment = options.alignment === 'center' ? 'center' : 'left';
  let bodySize = typography.bodyFontSize * 3;
  const minimumBodySize = 24;
  const titleSize = typography.titleFontSize * 3;
  const quoteSize = typography.quoteFontSize * 3;
  const quoteSpace = content.kind === 'verse' ? typography.quoteLineHeight * 3 : 0;
  let bodyLines: string[] = [];
  let titleLines: string[] = [];
  let bodyBlockHeight = 0;
  let bodyLineHeight = bodySize * 1.28;

  while (true) {
    context.font = `${content.kind === 'verse' ? '500' : '400'} ${bodySize}px ${
      content.kind === 'verse' ? '"Cormorant Garamond", Georgia, serif' : 'Manrope, Arial, sans-serif'
    }`;
    bodyLines = wrapCanvasText(context, content.body, textWidth);
    context.font = `600 ${titleSize}px "Cormorant Garamond", Georgia, serif`;
    titleLines = content.title ? wrapCanvasText(context, content.title, textWidth) : [];
    bodyLineHeight = bodySize * (measuredLength > 240 ? 1.2 : 1.28);
    bodyBlockHeight =
      quoteSpace +
      titleLines.length * titleSize * 1.08 +
      (titleLines.length ? 30 : 0) +
      bodyLines.length * bodyLineHeight;
    if (bodyBlockHeight <= availableBodyHeight || bodySize <= minimumBodySize) break;
    bodySize = Math.max(bodySize - 2, minimumBodySize);
  }

  let cursorY = contentTop + Math.max((availableBodyHeight - bodyBlockHeight) / 2, 0);
  context.textAlign = canvasAlignment;
  context.textBaseline = 'alphabetic';

  if (content.kind === 'verse') {
    context.fillStyle = template.accent;
    context.font = `500 italic ${quoteSize}px "Cormorant Garamond", Georgia, serif`;
    context.fillText('“', alignmentX, cursorY + quoteSpace * 0.8);
    cursorY += quoteSpace;
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
  drawCanvasLines(context, bodyLines, alignmentX, cursorY, bodyLineHeight);

  context.fillStyle = template.accent;
  const ruleX = options.alignment === 'center' ? dimensions.width / 2 - 63 : margin;
  context.fillRect(ruleX, referenceRuleY, 126, 5);
  context.fillStyle = template.text;
  context.font = '700 29px Manrope, Arial, sans-serif';
  context.letterSpacing = '4px';
  context.fillText(content.reference.toUpperCase(), alignmentX, referenceBaseline);
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
