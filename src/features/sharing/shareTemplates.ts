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
  const sizeAdjustment = textSize === 'compact' ? -2 : textSize === 'large' ? 2 : 0;
  const baseSize = aspect === 'story' ? 34 : 30;
  const lengthAdjustment =
    contentLength > 500
      ? -13
      : contentLength > 380
        ? -10
        : contentLength > 280
          ? -7
          : contentLength > 190
            ? -4
            : contentLength > 120
              ? -2
              : 0;
  return Math.max(baseSize + sizeAdjustment + lengthAdjustment, 15);
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
