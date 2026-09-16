/**
 * i18n Configuration for Multi-Language Support
 * Supports: English, Danish, German, Nepali, Newari
 *
 * Translations are bundled statically so they are available on first
 * render (no async initialization, no flash of untranslated content).
 */

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import en from '../locales/en/translation.json'
import da from '../locales/da/translation.json'
import de from '../locales/de/translation.json'
import ne from '../locales/ne/translation.json'
import newari from '../locales/new/translation.json'

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '\u{1F1EC}\u{1F1E7}', nativeName: 'English' },
  { code: 'da', name: 'Danish', flag: '\u{1F1E9}\u{1F1F0}', nativeName: 'Dansk' },
  { code: 'de', name: 'German', flag: '\u{1F1E9}\u{1F1EA}', nativeName: 'Deutsch' },
  { code: 'ne', name: 'Nepali', flag: '\u{1F1F3}\u{1F1F5}', nativeName: '\u0928\u0947\u092A\u093E\u0932\u0940' },
  { code: 'new', name: 'Newari', flag: '\u{1F1F3}\u{1F1F5}', nativeName: '\u0928\u0947\u0935\u093E\u0930\u0940' },
] as const

export const RTL_LANGUAGES = ['ne', 'new'] as const

export const isRTL = (lng: string): boolean =>
  (RTL_LANGUAGES as readonly string[]).includes(lng)

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      da: { translation: da },
      de: { translation: de },
      ne: { translation: ne },
      new: { translation: newari },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'da', 'de', 'ne', 'new'],
    nonExplicitSupportedLngs: true,
    interpolation: {
      escapeValue: false, // React already escapes by default
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  })

export default i18n
