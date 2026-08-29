import { forwardRef } from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import {
  getShareFontSize,
  getShareTemplate,
  SHARE_BRAND_WATERMARK,
  type ShareCardOptions,
  type ShareContent,
} from '@/features/sharing/shareTemplates';
import { fonts } from '@/theme/tokens';

type ShareCardProps = {
  content: ShareContent;
  options: ShareCardOptions;
  style?: ViewStyle;
};

export const ShareCard = forwardRef<View, ShareCardProps>(function ShareCard(
  { content, options, style },
  ref,
) {
  const template = getShareTemplate(options.templateId);
  const textAlign = options.alignment;
  const fontSize = getShareFontSize(content.body.length, options.textSize, options.aspect);
  const isStory = options.aspect === 'story';
  const maximumLines = isStory ? 26 : 18;

  return (
    <View
      collapsable={false}
      ref={ref}
      style={[
        styles.card,
        {
          aspectRatio: isStory ? 9 / 16 : 1,
          backgroundColor: template.background,
        },
        style,
      ]}
    >
      <View
        pointerEvents="none"
        style={[
          styles.halo,
          {
            backgroundColor: template.accent,
            height: isStory ? '44%' : '62%',
            opacity: options.templateId === 'parchment' ? 0.1 : 0.14,
            width: isStory ? '78%' : '70%',
          },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.orbit,
          {
            borderColor: template.accent,
            opacity: options.templateId === 'clay' ? 0.34 : 0.22,
          },
        ]}
      />

      <View style={[styles.brandRow, isStory && styles.brandRowStory]}>
        <View style={[styles.brandMark, { backgroundColor: template.accent }]}>
          <Text style={[styles.brandLetter, { color: template.onAccent }]}>A</Text>
        </View>
        <Text style={[styles.brand, { color: template.text }]}>ALIENTA</Text>
      </View>

      <View style={[styles.content, isStory && styles.contentStory]}>
        {content.kind === 'verse' ? (
          <Text
            accessibilityElementsHidden
            style={[styles.quoteMark, { color: template.accent, textAlign }]}
          >
            “
          </Text>
        ) : null}
        {content.title ? (
          <Text
            numberOfLines={isStory ? 4 : 3}
            style={[styles.title, { color: template.text, textAlign }]}
          >
            {content.title}
          </Text>
        ) : null}
        <Text
          adjustsFontSizeToFit
          minimumFontScale={0.6}
          numberOfLines={maximumLines}
          style={[
            styles.body,
            {
              color: template.text,
              fontFamily: content.kind === 'verse' ? fonts.serifMedium : fonts.sansRegular,
              fontSize,
              lineHeight: fontSize * 1.28,
              textAlign,
            },
          ]}
        >
          {content.body}
        </Text>
        <View
          style={[
            styles.referenceRule,
            {
              alignSelf: options.alignment === 'center' ? 'center' : 'flex-start',
              backgroundColor: template.accent,
            },
          ]}
        />
        <Text style={[styles.reference, { color: template.text, textAlign }]}>
          {content.reference.toUpperCase()}
        </Text>
      </View>

      <View style={[styles.footer, isStory && styles.footerStory]}>
        <Text style={[styles.attribution, { color: template.muted }]} numberOfLines={2}>
          {content.attribution}
        </Text>
        <Text style={[styles.watermark, { color: template.muted }]}>
          {SHARE_BRAND_WATERMARK}
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    alignSelf: 'center',
    borderRadius: 28,
    justifyContent: 'space-between',
    overflow: 'hidden',
    padding: 24,
    position: 'relative',
    width: '100%',
  },
  halo: {
    borderRadius: 999,
    position: 'absolute',
    right: '-18%',
    top: '-13%',
  },
  orbit: {
    borderRadius: 999,
    borderWidth: 1,
    bottom: '-18%',
    height: '42%',
    left: '-22%',
    position: 'absolute',
    width: '68%',
  },
  brandRow: { alignItems: 'center', flexDirection: 'row', gap: 9, zIndex: 1 },
  brandRowStory: { marginTop: 10 },
  brandMark: {
    alignItems: 'center',
    borderRadius: 11,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  brandLetter: { fontFamily: fonts.serifSemibold, fontSize: 19, lineHeight: 22 },
  brand: { fontFamily: fonts.sansBold, fontSize: 11, letterSpacing: 2.1 },
  content: { justifyContent: 'center', paddingVertical: 12, zIndex: 1 },
  contentStory: { flex: 1, paddingVertical: 42 },
  quoteMark: {
    fontFamily: fonts.serifItalic,
    fontSize: 54,
    lineHeight: 45,
    marginBottom: -4,
  },
  title: {
    fontFamily: fonts.serifSemibold,
    fontSize: 29,
    lineHeight: 33,
    marginBottom: 14,
  },
  body: { flexShrink: 1 },
  referenceRule: { height: 2, marginTop: 18, width: 42 },
  reference: {
    fontFamily: fonts.sansBold,
    fontSize: 10,
    letterSpacing: 1.3,
    lineHeight: 16,
    marginTop: 10,
  },
  footer: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    zIndex: 1,
  },
  footerStory: { marginBottom: 10 },
  attribution: { flex: 1, fontFamily: fonts.sansRegular, fontSize: 8, lineHeight: 12 },
  watermark: { fontFamily: fonts.sansSemibold, fontSize: 8, letterSpacing: 0.4 },
});
