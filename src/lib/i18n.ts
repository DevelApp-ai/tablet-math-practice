/**
 * i18n Configuration for Multi-Language Support
 * Supports: English, Danish, German, Nepali, Newari
 */

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Import translations - using dynamic imports for better code splitting
// These will be loaded lazily
const loadTranslations = async (lng: string) => {
  try {
    const translations = await import(`../locales/${lng}/translation.json`)
    return translations.default || translations
  } catch (error) {
    console.warn(`Failed to load translations for ${lng}, falling back to English`)
    const enTranslations = await import('../locales/en/translation.json')
    return enTranslations.default || enTranslations
  }
}

// Preload all translations
const preloadTranslations = async () => {
  const languages = ['en', 'da', 'de', 'ne', 'new']
  const loaded: Record<string, any> = {}
  
  await Promise.all(
    languages.map(async (lng) => {
      loaded[lng] = await loadTranslations(lng)
    })
  )
  
  return loaded
}

// Initialize i18n with preloaded translations
const initializeI18n = async () => {
  const translations = await preloadTranslations()
  
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: translations,
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false, // React already escapes by default
      },
      detection: {
        order: ['localStorage', 'navigator'],
        caches: ['localStorage'],
      },
      // RTL languages
      rtlLanguages: ['ne', 'new'],
    })
  
  return i18n
}

// Initialize immediately
initializeI18n().catch(console.error)

// Export initialized i18n instance
export default i18n

// Export languages for reference
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧', nativeName: 'English' },
  { code: 'da', name: 'Danish', flag: '🇩🇰', nativeName: 'Dansk' },
  { code: 'de', name: 'German', flag: '🇩🇪', nativeName: 'Deutsch' },
  { code: 'ne', name: 'Nepali', flag: '🇳🇵', nativeName: 'नेपाली' },
  { code: 'new', name: 'Newari', flag: '🇳🇵', nativeName: 'नेवारी' },
] as const

// Export RTL languages
export const RTL_LANGUAGES = ['ne', 'new'] as const

// Export helper to check if language is RTL
export const isRTL = (lng: string): boolean => RTL_LANGUAGES.includes(lng)
