/**
 * Language Selector Component
 * Allows users to change the application language
 */

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { CaretDown } from '@phosphor-icons/react'
import { SUPPORTED_LANGUAGES } from '@/lib/i18n'

export const LanguageSelector = () => {
  const { i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('#language-selector')) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
    setIsOpen(false)
  }

  const currentLanguage = SUPPORTED_LANGUAGES.find(
    (lang) => lang.code === i18n.language
  ) || SUPPORTED_LANGUAGES[0]

  return (
    <div
      id="language-selector"
      className="relative"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-card rounded-lg shadow-sm border border-border hover:bg-muted transition-colors"
        aria-label="Change language"
        title="Change language"
      >
        <span>{currentLanguage.flag}</span>
        <span className="hidden sm:inline">{currentLanguage.nativeName}</span>
        <CaretDown
          size={16}
          className="text-muted-foreground hidden sm:block"
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-card rounded-lg shadow-lg border border-border z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="py-1">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`w-full px-4 py-2 text-left hover:bg-muted transition-colors flex items-center gap-2 ${
                  i18n.language === lang.code
                    ? 'bg-primary/10'
                    : ''
                }`}
                aria-label={`Switch to ${lang.nativeName}`}
              >
                <span>{lang.flag}</span>
                <span>{lang.nativeName}</span>
                {i18n.language === lang.code && (
                  <span className="ml-auto text-primary">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default LanguageSelector
