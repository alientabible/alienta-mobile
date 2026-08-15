import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import esCO from '@/i18n/locales/es-CO.json';

const supportedLanguages = ['es-CO'] as const;

function getInitialLanguage() {
  const deviceLanguage = getLocales()[0]?.languageCode;

  if (deviceLanguage === 'es') return 'es-CO';
  return supportedLanguages[0];
}

if (!i18n.isInitialized) {
  // The default export is the i18next instance; `use` registers the React adapter.
  // eslint-disable-next-line import/no-named-as-default-member
  void i18n.use(initReactI18next).init({
    fallbackLng: 'es-CO',
    interpolation: {
      escapeValue: false,
    },
    lng: getInitialLanguage(),
    resources: {
      'es-CO': {
        translation: esCO,
      },
    },
    supportedLngs: supportedLanguages,
  });
}

export default i18n;
