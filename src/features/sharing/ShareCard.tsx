import { forwardRef } from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import {
  getShareTemplate,
  getShareTypography,
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
  const isStory = options.aspect === 'story';
  const measuredLength = content.body.length + (content.title?.length ?? 0) * 2;
  const typography = getShareTypography(measuredLength, options.textSize, options.aspect);

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
        <View style={styles.bodyArea}>
          {content.kind === 'verse' ? (
            <Text
              accessibilityElementsHidden
              style={[
                styles.quoteMark,
                {
                  color: template.accent,
                  fontSize: typography.quoteFontSize,
                  lineHeight: typography.quoteLineHeight,
                  textAlign,
                },
              ]}
            >
              “
            </Text>
          ) : null}
          {content.title ? (
            <Text
              numberOfLines={isStory ? 4 : 3}
              style={[
                styles.title,
                {
                  color: template.text,
                  fontSize: typography.titleFontSize,
                  lineHeight: typography.titleLineHeight,
                  textAlign,
                },
              ]}
            >
              {content.title}
            </Text>
          ) : null}
          <Text
            adjustsFontSizeToFit
            minimumFontScale={0.72}
            numberOfLines={typography.maximumBodyLines}
            style={[
              styles.body,
              {
                color: template.text,
                fontFamily: content.kind === 'verse' ? fonts.serifMedium : fonts.sansRegular,
                fontSize: typography.bodyFontSize,
                lineHeight: typography.bodyLineHeight,
                textAlign,
              },
            ]}
          >
            {content.body}
          </Text>
        </View>

        <View style={styles.referenceBlock}>
          <View
            style={[
              styles.referenceRule,
              {
                alignSelf: options.alignment === 'center' ? 'center' : 'flex-start',
                backgroundColor: template.accent,
              },
            ]}
          />
          <Text
            adjustsFontSizeToFit
            minimumFontScale={0.82}
            numberOfLines={2}
            style={[styles.reference, { color: template.text, textAlign }]}
          >
            {content.reference.toUpperCase()}
          </Text>
        </View>
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
  brandRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 0,
    gap: 9,
    zIndex: 1,
  },
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
  content: {
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
    paddingVertical: 10,
    zIndex: 1,
  },
  contentStory: { paddingVertical: 28 },
  bodyArea: {
    flex: 1,
    justifyContent: 'center',
    minHeight: 0,
    overflow: 'hidden',
  },
  quoteMark: {
    fontFamily: fonts.serifItalic,
    marginBottom: -4,
  },
  title: {
    fontFamily: fonts.serifSemibold,
    marginBottom: 14,
  },
  body: { flexShrink: 1, width: '100%' },
  referenceBlock: { flexShrink: 0, minHeight: 48, paddingTop: 8 },
  referenceRule: { height: 2, width: 42 },
  reference: {
    fontFamily: fonts.sansBold,
    fontSize: 10,
    letterSpacing: 1.3,
    lineHeight: 16,
    marginTop: 8,
  },
  footer: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    flexShrink: 0,
    gap: 12,
    justifyContent: 'space-between',
    minHeight: 24,
    zIndex: 1,
  },
  footerStory: { marginBottom: 10 },
  attribution: { flex: 1, fontFamily: fonts.sansRegular, fontSize: 8, lineHeight: 12 },
  watermark: { fontFamily: fonts.sansSemibold, fontSize: 8, letterSpacing: 0.4 },
});
