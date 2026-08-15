import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FeelingChip } from '@/components/feeling-chip';
import { colors } from '@/theme/colors';

const suggestedFeelings = [
  'Necesito paz',
  'Estoy agradecido',
  'Me siento solo',
  'Tengo esperanza',
];

export default function HomeScreen() {
  const [feeling, setFeeling] = useState('');
  const canContinue = feeling.trim().length > 0;

  const handleContinue = () => {
    if (!canContinue) return;

    Alert.alert(
      'Gracias por compartirlo',
      'En el siguiente hito conectaremos esta respuesta con versículos verificados y una reflexión segura.',
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brandRow}>
            <View accessibilityElementsHidden style={styles.brandMark}>
              <Text style={styles.brandLetter}>A</Text>
            </View>
            <Text accessibilityRole="header" style={styles.brandName}>
              Alienta
            </Text>
          </View>

          <View style={styles.hero}>
            <Text accessibilityRole="header" style={styles.eyebrow}>
              Un espacio para respirar
            </Text>
            <Text style={styles.title}>¿Cómo te sientes hoy?</Text>
            <Text style={styles.subtitle}>
              Escríbelo con tus propias palabras. Queremos acompañarte con sencillez y respeto.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.inputLabel}>Hoy me siento…</Text>
            <TextInput
              accessibilityLabel="Describe cómo te sientes hoy"
              maxLength={240}
              multiline
              onChangeText={setFeeling}
              onSubmitEditing={handleContinue}
              placeholder="Por ejemplo: estoy preocupado por mi familia"
              placeholderTextColor={colors.muted}
              selectionColor={colors.primary}
              style={styles.input}
              textAlignVertical="top"
              value={feeling}
            />

            <Pressable
              accessibilityHint="Continuará al acompañamiento bíblico"
              accessibilityRole="button"
              disabled={!canContinue}
              onPress={handleContinue}
              style={({ pressed }) => [
                styles.primaryButton,
                !canContinue && styles.primaryButtonDisabled,
                pressed && canContinue && styles.primaryButtonPressed,
              ]}
            >
              <Text style={styles.primaryButtonText}>Encontrar aliento</Text>
            </Pressable>
          </View>

          <View style={styles.suggestions}>
            <Text style={styles.sectionTitle}>También puedes elegir una opción</Text>
            <View style={styles.chipGroup}>
              {suggestedFeelings.map((item) => (
                <FeelingChip key={item} label={item} onPress={() => setFeeling(item)} />
              ))}
            </View>
          </View>

          <View style={styles.privacyNote}>
            <Text style={styles.privacySymbol}>✓</Text>
            <Text style={styles.privacyText}>
              Puedes explorar sin crear una cuenta. Tu respuesta no se guardará en este prototipo.
            </Text>
          </View>
        </ScrollView>

        <View accessibilityRole="tablist" style={styles.navigation}>
          <View accessibilityRole="tab" accessibilityState={{ selected: true }} style={styles.navItem}>
            <Text style={styles.navItemActive}>Inicio</Text>
          </View>
          <View accessibilityRole="tab" style={styles.navItem}>
            <Text style={styles.navItemText}>Biblia</Text>
          </View>
          <View accessibilityRole="tab" style={styles.navItem}>
            <Text style={styles.navItemText}>Comunidad</Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 28,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandMark: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    backgroundColor: colors.primary,
  },
  brandLetter: {
    color: colors.white,
    fontSize: 21,
    fontWeight: '800',
  },
  brandName: {
    color: colors.ink,
    fontSize: 21,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  hero: {
    marginTop: 48,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 10,
    color: colors.ink,
    fontSize: 38,
    fontWeight: '800',
    lineHeight: 44,
    letterSpacing: -0.8,
  },
  subtitle: {
    marginTop: 14,
    color: colors.muted,
    fontSize: 18,
    lineHeight: 27,
  },
  card: {
    marginTop: 30,
    borderWidth: 1,
    borderColor: colors.outline,
    borderRadius: 24,
    backgroundColor: colors.surface,
    padding: 20,
  },
  inputLabel: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '700',
  },
  input: {
    minHeight: 112,
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.outline,
    borderRadius: 16,
    backgroundColor: colors.background,
    color: colors.ink,
    fontSize: 17,
    lineHeight: 25,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  primaryButton: {
    minHeight: 54,
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
  },
  primaryButtonDisabled: {
    opacity: 0.45,
  },
  primaryButtonPressed: {
    backgroundColor: colors.primaryPressed,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '800',
  },
  suggestions: {
    marginTop: 30,
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '700',
  },
  chipGroup: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  privacyNote: {
    marginTop: 28,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderRadius: 16,
    backgroundColor: colors.primarySoft,
    padding: 16,
  },
  privacySymbol: {
    color: colors.primary,
    fontSize: 17,
    fontWeight: '900',
  },
  privacyText: {
    flex: 1,
    color: colors.ink,
    fontSize: 15,
    lineHeight: 22,
  },
  navigation: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.outline,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingBottom: Platform.OS === 'android' ? 6 : 0,
  },
  navItem: {
    minHeight: 48,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navItemActive: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '800',
  },
  navItemText: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: '600',
  },
});
