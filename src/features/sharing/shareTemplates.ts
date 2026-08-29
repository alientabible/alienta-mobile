export type ShareTemplateId = 'parchment' | 'garden' | 'clay' | 'midnight';
export type ShareCardAlignment = 'center' | 'left';
export type ShareTextSize = 'compact' | 'comfortable' | 'large';
export type ShareAspect = 'square' | 'story';
export type ShareContentKind = 'verse' | 'reflection';

export type ShareContent = {
  attribution: string;
  body: string;
  kind: ShareContentKind;
  reference: string;
  title?: string;
};

export type ShareCardOptions = {
  alignment: ShareCardAlignment;
  aspect: ShareAspect;
  templateId: ShareTemplateId;
  textSize: ShareTextSize;
};

export type ShareTemplate = {
  accent: string;
  background: string;
  id: ShareTemplateId;
  label: string;
  muted: string;
  onAccent: string;
  text: string;
};

export const SHARE_TEMPLATES: readonly ShareTemplate[] = [
  {
    id: 'parchment',
    label: 'Pergamino',
    background: '#F4EFE5',
    text: '#18342C',
    muted: '#66716C',
    accent: '#B66F55',
    onAccent: '#FFFDF7',
  },
  {
    id: 'garden',
    label: 'Jardín',
    background: '#18362E',
    text: '#FFF9EF',
    muted: '#C1D2C9',
    accent: '#A9C19F',
    onAccent: '#13251F',
  },
  {
    id: 'clay',
    label: 'Amanecer',
    background: '#E8C9BA',
    text: '#3C2923',
    muted: '#725C53',
    accent: '#A9513A',
    onAccent: '#FFF9F4',
  },
  {
    id: 'midnight',
    label: 'Quietud',
    background: '#122124',
    text: '#F6F1E8',
    muted: '#B8C7C6',
    accent: '#91B4B6',
    onAccent: '#102023',
  },
] as const;

export const DEFAULT_SHARE_OPTIONS: ShareCardOptions = {
  alignment: 'center',
  aspect: 'square',
  templateId: 'parchment',
  textSize: 'comfortable',
};

export const SHARE_BRAND_WATERMARK = 'ALIENTA';
export const SHARE_OUTPUT_WIDTH = 1080;

export type ShareTypography = {
  bodyFontSize: number;
  bodyLineHeight: number;
  maximumBodyLines: number;
  quoteFontSize: number;
  quoteLineHeight: number;
  titleFontSize: number;
  titleLineHeight: number;
};

export function getShareTemplate(templateId: ShareTemplateId) {
  return SHARE_TEMPLATES.find((template) => template.id === templateId) ?? SHARE_TEMPLATES[0];
}

export function getShareDimensions(aspect: ShareAspect) {
  return {
    height: aspect === 'story' ? 1920 : 1080,
    width: SHARE_OUTPUT_WIDTH,
  };
}

export function getShareFontSize(
  contentLength: number,
  textSize: ShareTextSize,
  aspect: ShareAspect,
) {
  return getShareTypography(contentLength, textSize, aspect).bodyFontSize;
}

/**
 * Returns deterministic typography for both the native preview and the web canvas.
 * React Native Web does not consistently support `adjustsFontSizeToFit`, so the
 * longest bundled verses need a conservative, platform-independent scale.
 */
export function getShareTypography(
  contentLength: number,
  textSize: ShareTextSize,
  aspect: ShareAspect,
): ShareTypography {
  const normalizedLength = Math.max(contentLength, 0);
  const comfortableSize = getComfortableBodySize(normalizedLength, aspect);
  const userScale = textSize === 'compact' ? 0.9 : textSize === 'large' ? 1.08 : 1;
  const bodyFontSize = roundToHalf(Math.max(comfortableSize * userScale, 10.5));
  const isDense = normalizedLength > 240;

  return {
    bodyFontSize,
    bodyLineHeight: roundToHalf(bodyFontSize * (isDense ? 1.2 : 1.28)),
    maximumBodyLines: aspect === 'story' ? 34 : 24,
    quoteFontSize: isDense ? 38 : 48,
    quoteLineHeight: isDense ? 34 : 41,
    titleFontSize: isDense ? 23 : 27,
    titleLineHeight: isDense ? 27 : 31,
  };
}

function getComfortableBodySize(contentLength: number, aspect: ShareAspect) {
  if (aspect === 'story') {
    if (contentLength <= 80) return 30;
    if (contentLength <= 130) return 27;
    if (contentLength <= 180) return 23;
    if (contentLength <= 240) return 20;
    if (contentLength <= 320) return 17;
    if (contentLength <= 420) return 15;
    if (contentLength <= 520) return 13;
    return 11.5;
  }

  if (contentLength <= 80) return 28;
  if (contentLength <= 130) return 25;
  if (contentLength <= 180) return 22;
  if (contentLength <= 240) return 19;
  if (contentLength <= 320) return 16;
  if (contentLength <= 420) return 14;
  if (contentLength <= 520) return 12;
  return 11;
}

function roundToHalf(value: number) {
  return Math.round(value * 2) / 2;
}

export function buildSharePlainText(content: ShareContent) {
  const body = content.kind === 'verse' ? `“${content.body}”` : content.body;
  return [content.title, body, content.reference, SHARE_BRAND_WATERMARK]
    .filter(Boolean)
    .join('\n\n');
}

export function createShareFilename(content: ShareContent) {
  const safeReference = content.reference
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
  return `alienta-${safeReference || content.kind}.png`;
}
