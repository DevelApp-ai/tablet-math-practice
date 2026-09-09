# Multi-Language Support Implementation Guide

This document outlines the implementation plan for adding multi-language support (Danish, German, Nepali, Newari) to the tablet-math-practice application.

## Implementation Strategy

**Recommended Library**: `react-i18next`

**Why react-i18next**:
- ✅ Excellent TypeScript support
- ✅ Namespace support for organizing translations
- ✅ Interpolation (variables in translations)
- ✅ Pluralization support
- ✅ RTL (Right-to-Left) language support
- ✅ Works with Vite out of the box
- ✅ Small bundle size (~5KB gzipped)

## Setup Instructions

### Step 1: Install Dependencies

```bash
npm install i18next react-i18next
npm install --save-dev @types/i18next
```

### Step 2: Create i18n Configuration

Create the i18n setup file:

```typescript
// src/lib/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import enTranslations from '../locales/en/translation.json';
import daTranslations from '../locales/da/translation.json';
import deTranslations from '../locales/de/translation.json';
import neTranslations from '../locales/ne/translation.json';
import newTranslations from '../locales/new/translation.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      da: { translation: daTranslations },
      de: { translation: deTranslations },
      ne: { translation: neTranslations },
      new: { translation: newTranslations },
    },
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
  });

export default i18n;
```

### Step 3: Wrap App with i18n Provider

Update `src/main.tsx`:

```typescript
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './lib/i18n';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### Step 4: Create Translation Files

**Directory Structure**:
```
src/
  locales/
    en/
      translation.json    # English (default)
    da/
      translation.json    # Danish
    de/
      translation.json    # German
    ne/
      translation.json    # Nepali
    new/
      translation.json    # Newari
```

## Translation Files

### English (Base) - `src/locales/en/translation.json`

```json
{
  "app": {
    "title": "Tablet Math Practice",
    "subtitle": "Improve your math skills with interactive exercises"
  },
  "nav": {
    "home": "Home",
    "practice": "Practice",
    "worksheets": "Worksheets",
    "stats": "Statistics",
    "settings": "Settings"
  },
  "difficulty": {
    "beginner": "Beginner",
    "intermediate": "Intermediate",
    "advanced": "Advanced",
    "expert": "Expert"
  },
  "operations": {
    "addition": "Addition",
    "subtraction": "Subtraction",
    "multiplication": "Multiplication",
    "division": "Division",
    "mixed": "Mixed"
  },
  "session": {
    "start": "Start Session",
    "next": "Next",
    "submit": "Submit",
    "restart": "Restart",
    "generateWorksheet": "Generate Worksheet",
    "problems": "{{count}} problems",
    "problemCount": "Number of problems"
  },
  "feedback": {
    "correct": "Correct! ✓",
    "incorrect": "Incorrect. Try again.",
    "perfect": "Perfect! All answers correct!",
    "streak": "{{count}} in a row! 🔥",
    "newStreakRecord": "New streak record: {{count}}!",
    "sessionComplete": "Session Complete!"
  },
  "stats": {
    "accuracy": "Accuracy",
    "correct": "Correct",
    "incorrect": "Incorrect",
    "time": "Time",
    "averageTime": "Avg. Time",
    "streak": "Current Streak",
    "longestStreak": "Longest Streak",
    "totalProblems": "Total Problems",
    "sessionHistory": "Session History"
  },
  "worksheet": {
    "title": "Math Worksheet",
    "instructions": "Solve each problem below:",
    "answerKey": "Answer Key",
    "print": "Print Worksheet",
    "download": "Download PDF"
  },
  "settings": {
    "title": "Settings",
    "language": "Language",
    "theme": "Theme",
    "sound": "Sound Effects",
    "animations": "Animations",
    "save": "Save"
  },
  "gamification": {
    "xp": "XP",
    "level": "Level",
    "badges": "Badges",
    "leaderboard": "Leaderboard",
    "achievements": "Achievements"
  },
  "common": {
    "today": "Today",
    "yesterday": "Yesterday",
    "daysAgo": "{{count}} days ago",
    "weeksAgo": "{{count}} weeks ago"
  }
}
```

### Danish - `src/locales/da/translation.json`

```json
{
  "app": {
    "title": "Matematik Øvelse",
    "subtitle": "Forbedre dine matematikfærdigheder med interaktive øvelser"
  },
  "nav": {
    "home": "Hjem",
    "practice": "Øvelse",
    "worksheets": "Ark",
    "stats": "Statistik",
    "settings": "Indstillinger"
  },
  "difficulty": {
    "beginner": "Begynder",
    "intermediate": "Mellem",
    "advanced": "Avanceret",
    "expert": "Ekspert"
  },
  "operations": {
    "addition": "Addition",
    "subtraction": "Subtraktion",
    "multiplication": "Multiplikation",
    "division": "Division",
    "mixed": "Blandet"
  },
  "session": {
    "start": "Start Session",
    "next": "Næste",
    "submit": "Indsend",
    "restart": "Start forfra",
    "generateWorksheet": "Generer Ark",
    "problems": "{{count}} opgaver",
    "problemCount": "Antal opgaver"
  },
  "feedback": {
    "correct": "Korrekt! ✓",
    "incorrect": "Forkert. Prøv igen.",
    "perfect": "Perfekt! Alle svar korrekte!",
    "streak": "{{count}} i træk! 🔥",
    "newStreakRecord": "Ny streak rekord: {{count}}!",
    "sessionComplete": "Session færdig!"
  },
  "stats": {
    "accuracy": "Nøjagtighed",
    "correct": "Korrekte",
    "incorrect": "Forkerte",
    "time": "Tid",
    "averageTime": "Gns. Tid",
    "streak": "Nuværende Streak",
    "longestStreak": "Længste Streak",
    "totalProblems": "Totale Opgaver",
    "sessionHistory": "Session Historik"
  },
  "worksheet": {
    "title": "Matematik Ark",
    "instructions": "Løs hver opgave nedenfor:",
    "answerKey": "Svar Nøgle",
    "print": "Udskriv Ark",
    "download": "Download PDF"
  },
  "settings": {
    "title": "Indstillinger",
    "language": "Sprog",
    "theme": "Tema",
    "sound": "Lyd Effekter",
    "animations": "Animationer",
    "save": "Gem"
  },
  "gamification": {
    "xp": "XP",
    "level": "Niveau",
    "badges": "Mærker",
    "leaderboard": "Leaderboard",
    "achievements": "Præstationer"
  },
  "common": {
    "today": "I dag",
    "yesterday": "I går",
    "daysAgo": "{{count}} dage siden",
    "weeksAgo": "{{count}} uger siden"
  }
}
```

### German - `src/locales/de/translation.json`

```json
{
  "app": {
    "title": "Mathe Übung",
    "subtitle": "Verbessern Sie Ihre Mathematikfähigkeiten mit interaktiven Übungen"
  },
  "nav": {
    "home": "Startseite",
    "practice": "Üben",
    "worksheets": "Arbeitsblätter",
    "stats": "Statistiken",
    "settings": "Einstellungen"
  },
  "difficulty": {
    "beginner": "Anfänger",
    "intermediate": "Mittelstufe",
    "advanced": "Fortgeschritten",
    "expert": "Experte"
  },
  "operations": {
    "addition": "Addition",
    "subtraction": "Subtraktion",
    "multiplication": "Multiplikation",
    "division": "Division",
    "mixed": "Gemischt"
  },
  "session": {
    "start": "Session starten",
    "next": "Nächste",
    "submit": "Einreichen",
    "restart": "Neu starten",
    "generateWorksheet": "Arbeitsblatt generieren",
    "problems": "{{count}} Aufgaben",
    "problemCount": "Anzahl der Aufgaben"
  },
  "feedback": {
    "correct": "Richtig! ✓",
    "incorrect": "Falsch. Versuchen Sie es erneut.",
    "perfect": "Perfekt! Alle Antworten richtig!",
    "streak": "{{count}} in Folge! 🔥",
    "newStreakRecord": "Neuer Streak-Rekord: {{count}}!",
    "sessionComplete": "Session abgeschlossen!"
  },
  "stats": {
    "accuracy": "Genauigkeit",
    "correct": "Richtig",
    "incorrect": "Falsch",
    "time": "Zeit",
    "averageTime": "Durchschnittszeit",
    "streak": "Aktueller Streak",
    "longestStreak": "Längster Streak",
    "totalProblems": "Gesamt Aufgaben",
    "sessionHistory": "Session-Verlauf"
  },
  "worksheet": {
    "title": "Mathe Arbeitsblatt",
    "instructions": "Lösen Sie jede Aufgabe unten:",
    "answerKey": "Lösungsblatt",
    "print": "Arbeitsblatt drucken",
    "download": "PDF herunterladen"
  },
  "settings": {
    "title": "Einstellungen",
    "language": "Sprache",
    "theme": "Thema",
    "sound": "Soundeffekte",
    "animations": "Animationen",
    "save": "Speichern"
  },
  "gamification": {
    "xp": "XP",
    "level": "Level",
    "badges": "Abzeichen",
    "leaderboard": "Bestenliste",
    "achievements": "Errungenschaften"
  },
  "common": {
    "today": "Heute",
    "yesterday": "Gestern",
    "daysAgo": "Vor {{count}} Tagen",
    "weeksAgo": "Vor {{count}} Wochen"
  }
}
```

### Nepali - `src/locales/ne/translation.json`

```json
{
  "app": {
    "title": "गणित अभ्यास",
    "subtitle": "आन्तरिक अभ्यासहरुको साथ तपाईंको गणित कौशल सुधार्नुहोस्"
  },
  "nav": {
    "home": "गृहपृष्ठ",
    "practice": "अभ्यास",
    "worksheets": "वर्कशिटहरु",
    "stats": "तथ्याङ्क",
    "settings": "सेटिङहरु"
  },
  "difficulty": {
    "beginner": "नयाँ सिक्ने",
    "intermediate": "मध्यम",
    "advanced": "उन्नत",
    "expert": "विशेषज्ञ"
  },
  "operations": {
    "addition": "योग",
    "subtraction": "बियोग",
    "multiplication": "गुणन",
    "division": "भाग",
    "mixed": "मिश्रित"
  },
  "session": {
    "start": "सत्र सुरु गर्नुहोस्",
    "next": "अर्को",
    "submit": "पेश गर्नुहोस्",
    "restart": "फेरि सुरु गर्नुहोस्",
    "generateWorksheet": "वर्कशिट बनाउनुहोस्",
    "problems": "{{count}} प्रश्नहरु",
    "problemCount": "प्रश्नहरुको सङ्ख्या"
  },
  "feedback": {
    "correct": "सही! ✓",
    "incorrect": "बेठिक। फेरि प्रयास गर्नुहोस्।",
    "perfect": "उत्कृष्ट! सबै उत्तर सही!",
    "streak": "{{count}} पटक लगातार! 🔥",
    "newStreakRecord": "नयाँ स्ट्रिक रेकर्ड: {{count}}!",
    "sessionComplete": "सत्र पूरा भयो!"
  },
  "stats": {
    "accuracy": "शुद्धता",
    "correct": "सही",
    "incorrect": "बेठिक",
    "time": "समय",
    "averageTime": "औसत समय",
    "streak": "हालको स्ट्रिक",
    "longestStreak": "लामो स्ट्रिक",
    "totalProblems": "कुल प्रश्नहरु",
    "sessionHistory": "सत्र इतिहास"
  },
  "worksheet": {
    "title": "गणित वर्कशिट",
    "instructions": "तलका प्रत्येक प्रश्नहरु समाधान गर्नुहोस्:",
    "answerKey": "उत्तर कुंजी",
    "print": "वर्कशिट प्रिन्ट गर्नुहोस्",
    "download": "पीडीएफ डाउनलोड गर्नुहोस्"
  },
  "settings": {
    "title": "सेटिङहरु",
    "language": "भाषा",
    "theme": "थिम",
    "sound": "ध्वनि प्रभावहरु",
    "animations": "एनिमेसनहरु",
    "save": "सेभ गर्नुहोस्"
  },
  "gamification": {
    "xp": "XP",
    "level": "लेभल",
    "badges": "ब्याजहरु",
    "leaderboard": "लीडरबोर्ड",
    "achievements": "उपलब्धिहरु"
  },
  "common": {
    "today": "आज",
    "yesterday": "हिजो",
    "daysAgo": "{{count}} दिन अगाडि",
    "weeksAgo": "{{count}} हप्ता अगाडि"
  }
}
```

### Newari - `src/locales/new/translation.json`

```json
{
  "app": {
    "title": "नेवारी गणित अभ्यास",
    "subtitle": "स्वयंसिद्ध अभ्याससँग तपाईंको गणित क्षमता बढाउनुहोस्"
  },
  "nav": {
    "home": "मुख्य पृष्ठ",
    "practice": "अभ्यास",
    "worksheets": "कार्यपत्रहरु",
    "stats": "तथ्याङ्क",
    "settings": "सेटिङहरु"
  },
  "difficulty": {
    "beginner": "नयाँ सिक्ने",
    "intermediate": "मध्यम",
    "advanced": "उन्नत",
    "expert": "विशेषज्ञ"
  },
  "operations": {
    "addition": "जम्मा",
    "subtraction": "बाकी",
    "multiplication": "गुणा",
    "division": "भाग",
    "mixed": "मिश्रित"
  },
  "session": {
    "start": "सत्र सुरु गर्नुहोस्",
    "next": "अर्को",
    "submit": "पेश गर्नुहोस्",
    "restart": "फेरि सुरु गर्नुहोस्",
    "generateWorksheet": "कार्यपत्र बनाउनुहोस्",
    "problems": "{{count}} प्रश्नहरु",
    "problemCount": "प्रश्नहरुको सङ्ख्या"
  },
  "feedback": {
    "correct": "मिल्यो! ✓",
    "incorrect": "मिलेन। फेरि प्रयास गर्नुहोस्।",
    "perfect": "उत्कृष्ट! सबै उत्तर मिल्यो!",
    "streak": "{{count}} पटक लगातार! 🔥",
    "newStreakRecord": "नयाँ स्ट्रिक रेकर्ड: {{count}}!",
    "sessionComplete": "सत्र पूरा भयो!"
  },
  "stats": {
    "accuracy": "शुद्धता",
    "correct": "मिल्यो",
    "incorrect": "मिलेन",
    "time": "समय",
    "averageTime": "औसत समय",
    "streak": "हालको स्ट्रिक",
    "longestStreak": "लामो स्ट्रिक",
    "totalProblems": "कुल प्रश्नहरु",
    "sessionHistory": "सत्र इतिहास"
  },
  "worksheet": {
    "title": "गणित कार्यपत्र",
    "instructions": "तलका प्रत्येक प्रश्नहरु समाधान गर्नुहोस्:",
    "answerKey": "उत्तर कुंजी",
    "print": "कार्यपत्र प्रिन्ट गर्नुहोस्",
    "download": "पीडीएफ डाउनलोड गर्नुहोस्"
  },
  "settings": {
    "title": "सेटिङहरु",
    "language": "भाषा",
    "theme": "थिम",
    "sound": "ध्वनि प्रभावहरु",
    "animations": "एनिमेसनहरु",
    "save": "सेभ गर्नुहोस्"
  },
  "gamification": {
    "xp": "XP",
    "level": "लेभल",
    "badges": "ब्याजहरु",
    "leaderboard": "लीडरबोर्ड",
    "achievements": "उपलब्धिहरु"
  },
  "common": {
    "today": "आज",
    "yesterday": "हिजो",
    "daysAgo": "{{count}} दिन अगाडि",
    "weeksAgo": "{{count}} हप्ता अगाडि"
  }
}
```

## RTL Support

### Step 1: Add RTL Direction Detection

The i18n configuration already includes RTL language detection:

```typescript
// In src/lib/i18n.ts
rtlLanguages: ['ne', 'new'],
```

### Step 2: Update CSS for RTL

Add to `src/index.css`:

```css
/* RTL Support */
[dir="rtl"] {
  direction: rtl;
  text-align: right;
}

[dir="rtl"] .text-left {
  text-align: right !important;
}

[dir="rtl"] .text-right {
  text-align: left !important;
}

[dir="rtl"] .mr-2 {
  margin-right: 0.5rem !important;
  margin-left: 0.5rem !important;
}

[dir="rtl"] .ml-2 {
  margin-left: 0.5rem !important;
  margin-right: 0.5rem !important;
}

[dir="rtl"] .pr-2 {
  padding-right: 0.5rem !important;
  padding-left: 0.5rem !important;
}

[dir="rtl"] .pl-2 {
  padding-left: 0.5rem !important;
  padding-right: 0.5rem !important;
}

[dir="rtl"] .float-right {
  float: left !important;
}

[dir="rtl"] .float-left {
  float: right !important;
}
```

### Step 3: Update HTML Direction

Modify `src/App.tsx`:

```typescript
// src/App.tsx
import { useTranslation } from 'react-i18next';

function App() {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir(i18n.language) === 'rtl';

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className={isRTL ? 'rtl' : ''}>
      {/* App content */}
    </div>
  );
}
```

## Localized Formatting

### Step 1: Create Formatting Utilities

```typescript
// src/lib/format.ts
import { useTranslation } from 'react-i18next';

export const useLocalizedNumber = () => {
  const { i18n } = useTranslation();

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat(i18n.language).format(num);
  };

  const formatDecimal = (num: number, decimals: number = 2): string => {
    return num.toLocaleString(i18n.language, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  const formatCurrency = (num: number, currency: string = 'USD'): string => {
    return num.toLocaleString(i18n.language, {
      style: 'currency',
      currency: currency,
    });
  };

  return { formatNumber, formatDecimal, formatCurrency };
};

export const useLocalizedDate = () => {
  const { i18n, t } = useTranslation();

  const formatDate = (date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString(i18n.language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options,
    });
  };

  const formatTime = (date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleTimeString(i18n.language, {
      hour: '2-digit',
      minute: '2-digit',
      ...options,
    });
  };

  const formatRelative = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - dateObj.getTime()) / 86400000);

    if (diffInDays === 0) return t('common.today');
    if (diffInDays === 1) return t('common.yesterday');
    if (diffInDays < 7) return t('common.daysAgo', { count: diffInDays });
    if (diffInDays < 30) return t('common.weeksAgo', { count: Math.floor(diffInDays / 7) });
    return formatDate(dateObj);
  };

  return { formatDate, formatTime, formatRelative };
};
```

### Step 2: Use Localized Formatting in Components

```typescript
// In ProblemDisplay.tsx
import { useLocalizedNumber } from '../lib/format';

const ProblemDisplay = ({ problem }: { problem: MathProblem }) => {
  const { formatNumber } = useLocalizedNumber();

  return (
    <div className="text-2xl font-semibold">
      {formatNumber(problem.num1)} {problem.operator} {formatNumber(problem.num2)} = ?
    </div>
  );
};
```

## Language Selector Component

```typescript
// src/components/LanguageSelector.tsx
import { useTranslation } from 'react-i18next';
import { ChevronDown } from '@phosphor-icons/react';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'da', name: 'Dansk', flag: '🇩🇰' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'ne', name: 'नेपाली', flag: '🇳🇵' },
  { code: 'new', name: 'नेवारी', flag: '🇳🇵' },
];

export const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setIsOpen(false);
  };

  const currentLanguage = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        aria-label="Change language"
        title="Change language"
      >
        <span>{currentLanguage.flag}</span>
        <span>{currentLanguage.name}</span>
        <ChevronDown size={16} className="text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 ${
                i18n.language === lang.code ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
              aria-label={`Switch to ${lang.name}`}
            >
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
```

## Using Translations in Components

### Basic Usage

```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('app.title')}</h1>
      <p>{t('app.subtitle')}</p>
    </div>
  );
}
```

### With Interpolation

```typescript
function SessionStats() {
  const { t } = useTranslation();
  const correctCount = 15;

  return (
    <div>
      <p>{t('session.problems', { count: correctCount })}</p>
      <p>{t('feedback.streak', { count: 5 })}</p>
    </div>
  );
}
```

### With Namespace

```typescript
// For organized translations
import { useTranslation } from 'react-i18next';

function SettingsPage() {
  const { t } = useTranslation('settings');

  return (
    <div>
      <h1>{t('title')}</h1>
      <button>{t('save')}</button>
    </div>
  );
}
```

## Testing Language Support

### Test Cases to Cover

1. **Language Switching**: Verify all languages can be selected and applied
2. **Fallback**: Verify fallback to English for missing translations
3. **Interpolation**: Verify variables are properly replaced
4. **RTL**: Verify Nepali and Newari display correctly in RTL
5. **Localized Formatting**: Verify numbers and dates format correctly
6. **Persistence**: Verify language selection persists across page reloads

### Example Test

```typescript
// src/components/__tests__/LanguageSelector.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageSelector } from '../LanguageSelector';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../lib/i18n';

describe('LanguageSelector', () => {
  it('renders all language options', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <LanguageSelector />
      </I18nextProvider>
    );

    const button = screen.getByLabelText('Change language');
    fireEvent.click(button);

    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Dansk')).toBeInTheDocument();
    expect(screen.getByText('Deutsch')).toBeInTheDocument();
    expect(screen.getByText('नेपाली')).toBeInTheDocument();
    expect(screen.getByText('नेवारी')).toBeInTheDocument();
  });

  it('changes language when selected', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <LanguageSelector />
      </I18nextProvider>
    );

    const button = screen.getByLabelText('Change language');
    fireEvent.click(button);

    const danishButton = screen.getByLabelText('Switch to Dansk');
    fireEvent.click(danishButton);

    expect(i18n.language).toBe('da');
  });
});
```

## Implementation Roadmap

### Phase 1: Core Setup (2-3 hours)
| Task | Effort | Priority |
|------|--------|----------|
| Install dependencies | 5m | High |
| Create i18n configuration | 30m | High |
| Create English translation | 30m | High |
| Add one test language (Danish) | 30m | High |
| Create LanguageSelector component | 1h | High |
| Test basic functionality | 30m | High |

### Phase 2: Complete Translations (4-6 hours)
| Task | Effort | Priority |
|------|--------|----------|
| German translation | 1h | High |
| Nepali translation | 1.5h | High |
| Newari translation | 1.5h | High |
| Review all translations | 1h | Medium |

### Phase 3: Advanced Features (3-4 hours)
| Task | Effort | Priority |
|------|--------|----------|
| RTL support | 1h | High |
| Localized formatting | 1h | Medium |
| Namespace organization | 1h | Low |
| Accessibility testing | 1h | Medium |

### Phase 4: Testing & Polish (2-3 hours)
| Task | Effort | Priority |
|------|--------|----------|
| Unit tests | 1h | High |
| Integration tests | 1h | High |
| Manual testing | 1h | Medium |

## Quick Start Commands

```bash
# 1. Install dependencies
npm install i18next react-i18next @types/i18next

# 2. Create directory structure
mkdir -p src/lib/i18n src/locales/{en,da,de,ne,new} src/components/language

# 3. Create files
-touch src/lib/i18n.ts \
  src/locales/en/translation.json \
  src/locales/da/translation.json \
  src/locales/de/translation.json \
  src/locales/ne/translation.json \
  src/locales/new/translation.json \
  src/components/LanguageSelector.tsx \
  src/lib/format.ts

# 4. Update main.tsx to import i18n
```

## File Structure

```
src/
├── components/
│   ├── LanguageSelector.tsx
│   └── language/
│       └── (future language-specific components)
├── lib/
│   ├── i18n/
│   │   ├── i18n.ts
│   │   └── format.ts
│   └── types.ts
├── locales/
│   ├── en/
│   │   └── translation.json
│   ├── da/
│   │   └── translation.json
│   ├── de/
│   │   └── translation.json
│   ├── ne/
│   │   └── translation.json
│   └── new/
│       └── translation.json
└── App.tsx (updated with dir attribute)
```

## Additional Notes

### Translation Tips

1. **Keep translation keys consistent** across all languages
2. **Use descriptive keys** that indicate context
3. **Avoid concatenation** - use interpolation instead
4. **Test RTL languages** thoroughly
5. **Consider text expansion** - some languages need more space

### Performance Considerations

1. **Preload translations** for better performance
2. **Use lazy loading** for less common languages
3. **Cache translations** in localStorage
4. **Consider bundle splitting** for production

### Accessibility

1. **Ensure language changes** are announced to screen readers
2. **Maintain proper text direction** for RTL languages
3. **Test with screen readers** for each language
4. **Use proper semantic HTML** in all languages
