import * as Clipboard from 'expo-clipboard';
import { Platform } from 'react-native';

import type { GeneratedShareImage } from '@/features/sharing/createShareImage';
import { buildSharePlainText, type ShareContent } from '@/features/sharing/shareTemplates';

export type ShareImageOutcome = 'cancelled' | 'downloaded' | 'shared';

export async function copyShareText(content: ShareContent) {
  return Clipboard.setStringAsync(buildSharePlainText(content));
}

export async function shareGeneratedImage(
  image: GeneratedShareImage,
  content: ShareContent,
): Promise<ShareImageOutcome> {
  if (Platform.OS === 'web') {
    return shareGeneratedImageOnWeb(image, content);
  }

  const Sharing = await import('expo-sharing');
  const available = await Sharing.isAvailableAsync();
  if (!available) throw new Error('SHARING_UNAVAILABLE');
  await Sharing.shareAsync(image.uri, {
    dialogTitle: 'Compartir desde Alienta',
    mimeType: image.mimeType,
    UTI: 'public.png',
  });
  return 'shared';
}

async function shareGeneratedImageOnWeb(
  image: GeneratedShareImage,
  content: ShareContent,
): Promise<ShareImageOutcome> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new Error('SHARING_UNAVAILABLE');
  }

  const response = await fetch(image.uri);
  const blob = await response.blob();
  const file = new File([blob], image.fileName, { type: image.mimeType });
  const shareData: ShareData = {
    files: [file],
    text: buildSharePlainText(content),
    title: 'Alienta',
  };

  if (navigator.share && (!navigator.canShare || navigator.canShare(shareData))) {
    try {
      await navigator.share(shareData);
      return 'shared';
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return 'cancelled';
      throw error;
    }
  }

  const downloadLink = document.createElement('a');
  downloadLink.download = image.fileName;
  downloadLink.href = image.uri;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  downloadLink.remove();
  return 'downloaded';
}
