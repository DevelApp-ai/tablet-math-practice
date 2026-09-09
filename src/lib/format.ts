/**
 * Localized Formatting Utilities
 * Provides number, date, and currency formatting based on current language
 */

import { useTranslation } from 'react-i18next'

/**
 * Hook for localized number formatting
 * Returns functions to format numbers according to the current language
 */
export const useLocalizedNumber = () => {
  const { i18n } = useTranslation()

  /**
   * Format a number according to current locale
   * @param num - Number to format
   * @returns Formatted number string
   */
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat(i18n.language).format(num)
  }

  /**
   * Format a decimal number with specific precision
   * @param num - Number to format
   * @param decimals - Number of decimal places (default: 2)
   * @returns Formatted decimal string
   */
  const formatDecimal = (num: number, decimals: number = 2): string => {
    return num.toLocaleString(i18n.language, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
  }

  /**
   * Format a number as currency
   * @param num - Number to format
   * @param currency - Currency code (default: USD)
   * @returns Formatted currency string
   */
  const formatCurrency = (num: number, currency: string = 'USD'): string => {
    return num.toLocaleString(i18n.language, {
      style: 'currency',
      currency: currency,
    })
  }

  /**
   * Format a number with compact notation (e.g., 1K, 1M)
   * @param num - Number to format
   * @returns Compact formatted string
   */
  const formatCompact = (num: number): string => {
    return new Intl.NumberFormat(i18n.language, {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(num)
  }

  return { formatNumber, formatDecimal, formatCurrency, formatCompact }
}

/**
 * Hook for localized date formatting
 * Returns functions to format dates according to the current language
 */
export const useLocalizedDate = () => {
  const { i18n, t } = useTranslation()

  /**
   * Format a date
   * @param date - Date to format (Date object or ISO string)
   * @param options - Intl.DateTimeFormatOptions
   * @returns Formatted date string
   */
  const formatDate = (
    date: Date | string,
    options?: Intl.DateTimeFormatOptions
  ): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleDateString(i18n.language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options,
    })
  }

  /**
   * Format a time
   * @param date - Date to format (Date object or ISO string)
   * @param options - Intl.DateTimeFormatOptions
   * @returns Formatted time string
   */
  const formatTime = (
    date: Date | string,
    options?: Intl.DateTimeFormatOptions
  ): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleTimeString(i18n.language, {
      hour: '2-digit',
      minute: '2-digit',
      ...options,
    })
  }

  /**
   * Format a date and time together
   * @param date - Date to format
   * @returns Formatted date-time string
   */
  const formatDateTime = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleString(i18n.language, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  /**
   * Format a relative date (e.g., "Today", "Yesterday", "3 days ago")
   * @param date - Date to format
   * @returns Relative date string
   */
  const formatRelative = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    const now = new Date()
    const diffInDays = Math.floor(
      (now.getTime() - dateObj.getTime()) / 86400000
    )

    if (diffInDays === 0) return t('common.today')
    if (diffInDays === 1) return t('common.yesterday')
    if (diffInDays < 7)
      return t('common.daysAgo', { count: diffInDays })
    if (diffInDays < 30)
      return t('common.weeksAgo', { count: Math.floor(diffInDays / 7) })
    if (diffInDays < 365)
      return t('common.monthsAgo', { count: Math.floor(diffInDays / 30) })
    return formatDate(dateObj)
  }

  /**
   * Format a duration (e.g., "2 hours, 30 minutes")
   * @param seconds - Duration in seconds
   * @returns Formatted duration string
   */
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    const parts: string[] = []
    if (hours > 0) {
      parts.push(t('time.hours', { count: hours, plural: hours !== 1 ? 's' : '' }))
    }
    if (minutes > 0) {
      parts.push(t('time.minutes', { count: minutes, plural: minutes !== 1 ? 's' : '' }))
    }
    if (secs > 0 && hours === 0) {
      parts.push(t('time.seconds', { count: secs, plural: secs !== 1 ? 's' : '' }))
    }

    return parts.join(' ')
  }

  return { formatDate, formatTime, formatDateTime, formatRelative, formatDuration }
}

/**
 * Hook for localized number formatting with pluralization support
 * Useful for displaying counts with proper plural forms
 */
export const usePluralization = () => {
  const { i18n, t } = useTranslation()

  /**
   * Get plural suffix based on count and language
   * @param count - The count
   * @returns Plural suffix ('' or 's' for English, different for other languages)
   */
  const getPluralSuffix = (count: number): string => {
    // For English, simple rule: add 's' if count !== 1
    if (i18n.language === 'en') {
      return count !== 1 ? 's' : ''
    }
    // For other languages, we rely on the translation files
    return ''
  }

  /**
   * Format a count with proper pluralization
   * @param key - Translation key (e.g., 'time.seconds')
   * @param count - The count
   * @returns Translated string with proper pluralization
   */
  const formatPlural = (key: string, count: number): string => {
    return t(key, { count, plural: getPluralSuffix(count) })
  }

  return { getPluralSuffix, formatPlural }
}
