# Gamification Implementation Guide

This document outlines the implementation plan for adding gamification features to the tablet-math-practice application.

## Features Overview

### 1. Experience Points (XP) & Leveling System

**Purpose**: Reward users for solving problems and progressing through the app.

**Implementation Files**:
- `src/lib/types.ts` - Add `UserProfile` interface
- `src/lib/scoring.ts` - XP calculation functions
- `src/components/XPProgressBar.tsx` - New component
- `src/components/LevelBadge.tsx` - New component
- `src/App.tsx` - Integrate XP tracking

**XP Rewards Configuration**:
```typescript
const XP_REWARDS = {
  correctAnswer: 10,
  streakBonus: 5,      // Per consecutive correct
  speedBonus: 15,      // If answered < 5 seconds
  perfectSession: 50, // 100% accuracy
  dailyLogin: 20,
};

const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 4000, 8000, 16000];
```

**Type Definitions**:
```typescript
interface UserProfile {
  xp: number;
  level: number;
  xpToNextLevel: number;
  badges: Badge[];
  dailyStreak: DailyStreak;
  settings: UserSettings;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedAt: Date | null;
}

interface DailyStreak {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  returnBonusClaimed: boolean;
}

interface UserSettings {
  soundEnabled: boolean;
  animationsEnabled: boolean;
  theme: string;
}
```

### 2. Achievement Badges System

**Badge Definitions**:
- `first_blood` - First correct answer
- `perfect_10` - 10 in a row
- `perfect_25` - 25 in a row
- `perfect_50` - 50 in a row
- `speed_demon` - 10 answers < 3 seconds each
- `marathon` - 100 problems in one session
- `weekend_warrior` - 5 days in a row
- `month_streak` - 30 days in a row
- `addition_master` - 100 addition problems correct
- `subtraction_master` - 100 subtraction problems correct
- `multiplication_master` - 100 multiplication problems correct
- `division_master` - 100 division problems correct

**Implementation**:
- Badge checking logic in `src/lib/scoring.ts`
- Display component in `src/components/BadgeDisplay.tsx`
- Toast notification in `src/components/BadgeToast.tsx`

### 3. Daily Streaks & Return Bonuses

**Features**:
- Track consecutive days of practice
- Bonus XP for returning after absence
- Visual streak counter

**Implementation**:
- Streak calculation in `src/lib/scoring.ts`
- Display in `src/components/DailyStreakCard.tsx`

### 4. Timer Challenges & Speed Bonuses

**Features**:
- Optional timed mode
- Time-based scoring bonuses
- Countdown timer display

**Implementation**:
- Timer logic in `src/App.tsx`
- Display in `src/components/TimerDisplay.tsx`
- Mode selector in `src/components/ModeSelector.tsx`

### 5. Leaderboard

**Implementation Options**:
- **Option A**: Local storage only (no backend)
- **Option B**: GitHub Pages + JSON storage (shared leaderboard)

**Files**:
- `src/lib/leaderboard.ts` - Leaderboard management
- `src/components/Leaderboard.tsx` - Display
- `src/components/NameInputModal.tsx` - Get user name

### 6. Unlockable Themes

**Features**:
- Visual themes unlockable by level
- Theme selector component

**Implementation**:
- Theme definitions in `src/lib/themes.ts`
- Selector in `src/components/ThemeSelector.tsx`
- Apply theme in `src/App.tsx` and `src/index.css`

### 7. Progress Visualization Dashboard

**Features**:
- Charts showing accuracy over time
- Weekly activity visualization
- Streak history

**Implementation**:
- Chart components using `react-chartjs-2`
- Enhanced `src/components/StatsDashboard.tsx`

**Dependencies**:
```bash
npm install chart.js react-chartjs-2
```

### 8. Sound Effects & Celebration Animations

**Features**:
- Audio feedback for correct/incorrect answers
- Achievement celebrations

**Implementation**:
- Sound management in `src/lib/sounds.ts`
- Settings toggle in `src/components/SettingsModal.tsx`

**Dependencies**:
```bash
npm install react-confetti
```

## Implementation Roadmap

### Phase 1: Core Gamification (Week 1-2)
| Task | Effort | Priority |
|------|--------|----------|
| XP & Leveling System | 4-6h | High |
| Streak Tracking | 3-4h | High |
| Achievement Badges | 6-8h | High |
| Timer Challenges | 4-5h | Medium |
| Progress Dashboard | 4-5h | Medium |

### Phase 2: Advanced Features (Week 3-4)
| Task | Effort | Priority |
|------|--------|----------|
| Leaderboard | 5-7h | Medium |
| Unlockable Themes | 4-6h | Low |
| Sound Effects | 2-3h | Low |
| Charts & Visualizations | 4-5h | Low |

### Phase 3: Polish & Testing (Week 4)
| Task | Effort | Priority |
|------|--------|----------|
| Testing | 4-6h | High |
| Accessibility Audit | 2-3h | Medium |
| Performance Optimization | 2-3h | Medium |

## Quick Start

To begin implementing gamification:

1. **Add Type Definitions**:
   ```bash
   # Edit src/lib/types.ts
   ```

2. **Create Scoring Service**:
   ```bash
   touch src/lib/scoring.ts
   ```

3. **Create Components**:
   ```bash
   mkdir -p src/components/gamification
   touch src/components/gamification/XPProgressBar.tsx
   touch src/components/gamification/LevelBadge.tsx
   touch src/components/gamification/BadgeDisplay.tsx
   ```

4. **Update App.tsx**:
   - Add XP tracking
   - Add streak calculation
   - Integrate gamification components

## Testing

All gamification features should include:
- Unit tests for scoring logic
- Integration tests for components
- E2E tests for user flows

Example test file: `src/lib/__tests__/gamification.test.ts`

## Dependencies

Required packages:
```bash
npm install chart.js react-chartjs-2 react-confetti
```

Optional packages:
```bash
# For enhanced animations
npm install framer-motion

# For sound effects
npm install howler
```

## File Structure

```
src/
├── components/
│   └── gamification/
│       ├── BadgeDisplay.tsx
│       ├── BadgeToast.tsx
│       ├── LevelBadge.tsx
│       ├── XPProgressBar.tsx
│       ├── XPProgressRing.tsx
│       ├── Leaderboard.tsx
│       ├── AchievementCard.tsx
│       ├── StreakDisplay.tsx
│       ├── TimerDisplay.tsx
│       └── ModeSelector.tsx
├── lib/
│   ├── gamification/
│   │   ├── scoring.ts
│   │   ├── achievements.ts
│   │   ├── streaks.ts
│   │   ├── leaderboard.ts
│   │   └── themes.ts
│   └── types.ts
└── hooks/
    ├── useXP.ts
    ├── useStreaks.ts
    └── useLeaderboard.ts
```
