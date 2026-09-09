/**
 * Scoring Service for Gamification Features
 * Handles XP calculation, leveling, streaks, and badge checking
 */

import {
  XP_REWARDS,
  LEVEL_THRESHOLDS,
  Badge,
  BadgeId,
  DailyStreak,
  UserProfile,
  SessionStats,
  Problem,
} from './types'

// ============================================================================
// XP and Leveling System
// ============================================================================

/**
 * Calculate XP earned for a single problem
 * @param isCorrect - Whether the answer was correct
 * @param timeTaken - Time taken to answer in milliseconds
 * @param currentStreak - Current consecutive correct streak
 * @returns XP earned
 */
export const calculateXPForProblem = (
  isCorrect: boolean,
  timeTaken: number,
  currentStreak: number
): number => {
  if (!isCorrect) return 0

  let xp = XP_REWARDS.correctAnswer

  // Speed bonus: answered in less than 5 seconds
  if (timeTaken < 5000) {
    xp += XP_REWARDS.speedBonus
  }

  // Streak bonus: consecutive correct answers
  if (currentStreak > 1) {
    xp += XP_REWARDS.streakBonus * (currentStreak - 1)
  }

  return xp
}

/**
 * Calculate level from XP
 * @param xp - Total XP
 * @returns Level (1-based index)
 */
export const calculateLevelFromXP = (xp: number): number => {
  let level = 1
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      level = i + 1
      break
    }
  }
  return level
}

/**
 * Calculate XP to next level
 * @param xp - Current XP
 * @returns XP needed to reach next level
 */
export const calculateXPToNextLevel = (xp: number): number => {
  const currentLevel = calculateLevelFromXP(xp)
  const nextLevelThreshold = LEVEL_THRESHOLDS[currentLevel] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]
  return Math.max(0, nextLevelThreshold - xp)
}

/**
 * Update user profile with new XP
 * @param profile - Current user profile
 * @param xpEarned - XP to add
 * @returns Updated user profile
 */
export const addXPToProfile = (profile: UserProfile, xpEarned: number): UserProfile => {
  const newXP = profile.xp + xpEarned
  const newLevel = calculateLevelFromXP(newXP)
  const newXPToNextLevel = calculateXPToNextLevel(newXP)

  return {
    ...profile,
    xp: newXP,
    level: newLevel,
    xpToNextLevel: newXPToNextLevel,
  }
}

// ============================================================================
// Streak System
// ============================================================================

/**
 * Calculate new streak based on current answer
 * @param isCorrect - Whether the current answer was correct
 * @param previousWasCorrect - Whether the previous answer was correct
 * @param currentStreak - Current consecutive correct streak
 * @returns New streak count
 */
export const calculateNewStreak = (
  isCorrect: boolean,
  previousWasCorrect: boolean,
  currentStreak: number
): number => {
  if (!isCorrect) {
    return 0
  }
  
  // If this is correct and previous was correct, increment streak
  if (previousWasCorrect) {
    return currentStreak + 1
  }
  
  // If this is correct but previous was wrong (or first problem), start new streak
  return 1
}

/**
 * Update daily streak
 * @param dailyStreak - Current daily streak
 * @param lastActiveDate - Last active date (ISO string)
 * @returns Updated daily streak
 */
export const updateDailyStreak = (
  dailyStreak: DailyStreak,
  lastActiveDate: string
): DailyStreak => {
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  // If already active today, no change
  if (dailyStreak.lastActiveDate === today) {
    return dailyStreak
  }

  // If active yesterday, continue streak
  if (dailyStreak.lastActiveDate === yesterday) {
    return {
      ...dailyStreak,
      currentStreak: dailyStreak.currentStreak + 1,
      longestStreak: Math.max(
        dailyStreak.longestStreak,
        dailyStreak.currentStreak + 1
      ),
      lastActiveDate: today,
      returnBonusClaimed: false,
    }
  }

  // Otherwise, reset streak
  return {
    currentStreak: 1,
    longestStreak: dailyStreak.longestStreak,
    lastActiveDate: today,
    returnBonusClaimed: false,
  }
}

/**
 * Get return bonus XP (for coming back after absence)
 * @param dailyStreak - Current daily streak
 * @returns Bonus XP (0 if no bonus available)
 */
export const getReturnBonus = (dailyStreak: DailyStreak): number => {
  if (dailyStreak.currentStreak === 1 && dailyStreak.longestStreak > 0 && !dailyStreak.returnBonusClaimed) {
    return XP_REWARDS.dailyLogin * 2 // Double bonus for returning
  }
  return 0
}

/**
 * Claim return bonus
 * @param dailyStreak - Current daily streak
 * @returns Updated daily streak with bonus claimed
 */
export const claimReturnBonus = (dailyStreak: DailyStreak): DailyStreak => ({
  ...dailyStreak,
  returnBonusClaimed: true,
})

// ============================================================================
// Badge System
// ============================================================================

/**
 * Badge definitions
 */
const BADGE_DEFINITIONS: Record<BadgeId, Omit<Badge, 'earned' | 'earnedAt'>> = {
  first_blood: {
    id: 'first_blood',
    name: 'First Blood',
    description: 'Solve your first problem correctly',
    icon: '🎯',
  },
  perfect_10: {
    id: 'perfect_10',
    name: 'Perfect 10',
    description: 'Get 10 correct answers in a row',
    icon: '🔥',
  },
  perfect_25: {
    id: 'perfect_25',
    name: 'Perfect 25',
    description: 'Get 25 correct answers in a row',
    icon: '🔥🔥',
  },
  perfect_50: {
    id: 'perfect_50',
    name: 'Perfect 50',
    description: 'Get 50 correct answers in a row',
    icon: '🔥🔥🔥',
  },
  speed_demon: {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Answer 10 problems correctly in under 3 seconds each',
    icon: '⚡',
  },
  marathon: {
    id: 'marathon',
    name: 'Marathon',
    description: 'Solve 100 problems in a single session',
    icon: '🏃',
  },
  weekend_warrior: {
    id: 'weekend_warrior',
    name: 'Weekend Warrior',
    description: 'Practice for 5 consecutive days',
    icon: '📅',
  },
  month_streak: {
    id: 'month_streak',
    name: 'Month Streak',
    description: 'Practice for 30 consecutive days',
    icon: '🗓️',
  },
  addition_master: {
    id: 'addition_master',
    name: 'Addition Master',
    description: 'Solve 100 addition problems correctly',
    icon: '➕',
  },
  subtraction_master: {
    id: 'subtraction_master',
    name: 'Subtraction Master',
    description: 'Solve 100 subtraction problems correctly',
    icon: '➖',
  },
  multiplication_master: {
    id: 'multiplication_master',
    name: 'Multiplication Master',
    description: 'Solve 100 multiplication problems correctly',
    icon: '✖️',
  },
  division_master: {
    id: 'division_master',
    name: 'Division Master',
    description: 'Solve 100 division problems correctly',
    icon: '➗',
  },
}

/**
 * Initialize all badges as unearned
 * @returns Array of all badge definitions (unearned)
 */
export const initializeBadges = (): Badge[] => {
  return Object.values(BADGE_DEFINITIONS).map((badge) => ({
    ...badge,
    earned: false,
    earnedAt: null,
  }))
}

/**
 * Check which badges should be earned based on session and profile
 * @param sessionStats - Current session statistics
 * @param profile - Current user profile
 * @param problems - Array of problems in current session
 * @returns Array of newly earned badges
 */
export const checkBadges = (
  sessionStats: SessionStats,
  profile: UserProfile,
  problems: Problem[] = []
): Badge[] => {
  const earnedBadges: Badge[] = []
  const now = new Date()

  // Helper to check if badge already earned
  const isAlreadyEarned = (badgeId: BadgeId): boolean => {
    return profile.badges.some((b) => b.id === badgeId && b.earned)
  }

  // 1. First Blood - First correct answer
  if (sessionStats.correctAnswers >= 1 && !isAlreadyEarned('first_blood')) {
    earnedBadges.push({
      ...BADGE_DEFINITIONS.first_blood,
      earned: true,
      earnedAt: now,
    })
  }

  // 2. Perfect streaks
  if (sessionStats.longestStreak >= 10 && !isAlreadyEarned('perfect_10')) {
    earnedBadges.push({
      ...BADGE_DEFINITIONS.perfect_10,
      earned: true,
      earnedAt: now,
    })
  }
  if (sessionStats.longestStreak >= 25 && !isAlreadyEarned('perfect_25')) {
    earnedBadges.push({
      ...BADGE_DEFINITIONS.perfect_25,
      earned: true,
      earnedAt: now,
    })
  }
  if (sessionStats.longestStreak >= 50 && !isAlreadyEarned('perfect_50')) {
    earnedBadges.push({
      ...BADGE_DEFINITIONS.perfect_50,
      earned: true,
      earnedAt: now,
    })
  }

  // 3. Speed Demon - 10 fast correct answers
  const fastAnswers = problems.filter(
    (p) => p.isCorrect && p.timeSpent && p.timeSpent < 3000
  ).length
  if (fastAnswers >= 10 && !isAlreadyEarned('speed_demon')) {
    earnedBadges.push({
      ...BADGE_DEFINITIONS.speed_demon,
      earned: true,
      earnedAt: now,
    })
  }

  // 4. Marathon - 100 problems in session
  if (sessionStats.totalProblems >= 100 && !isAlreadyEarned('marathon')) {
    earnedBadges.push({
      ...BADGE_DEFINITIONS.marathon,
      earned: true,
      earnedAt: now,
    })
  }

  // 5. Daily streaks
  if (profile.dailyStreak.currentStreak >= 5 && !isAlreadyEarned('weekend_warrior')) {
    earnedBadges.push({
      ...BADGE_DEFINITIONS.weekend_warrior,
      earned: true,
      earnedAt: now,
    })
  }
  if (profile.dailyStreak.currentStreak >= 30 && !isAlreadyEarned('month_streak')) {
    earnedBadges.push({
      ...BADGE_DEFINITIONS.month_streak,
      earned: true,
      earnedAt: now,
    })
  }

  // 6. Operation mastery (count correct answers per operation in all problems)
  const operationCounts: Record<string, number> = {}
  problems.forEach((p) => {
    if (p.isCorrect && p.operation) {
      operationCounts[p.operation] = (operationCounts[p.operation] || 0) + 1
    }
  })

  if (operationCounts['addition'] >= 100 && !isAlreadyEarned('addition_master')) {
    earnedBadges.push({
      ...BADGE_DEFINITIONS.addition_master,
      earned: true,
      earnedAt: now,
    })
  }
  if (operationCounts['subtraction'] >= 100 && !isAlreadyEarned('subtraction_master')) {
    earnedBadges.push({
      ...BADGE_DEFINITIONS.subtraction_master,
      earned: true,
      earnedAt: now,
    })
  }
  if (operationCounts['multiplication'] >= 100 && !isAlreadyEarned('multiplication_master')) {
    earnedBadges.push({
      ...BADGE_DEFINITIONS.multiplication_master,
      earned: true,
      earnedAt: now,
    })
  }
  if (operationCounts['division'] >= 100 && !isAlreadyEarned('division_master')) {
    earnedBadges.push({
      ...BADGE_DEFINITIONS.division_master,
      earned: true,
      earnedAt: now,
    })
  }

  return earnedBadges
}

/**
 * Add earned badges to profile
 * @param profile - Current user profile
 * @param newBadges - Newly earned badges
 * @returns Updated user profile
 */
export const addBadgesToProfile = (profile: UserProfile, newBadges: Badge[]): UserProfile => {
  const existingBadges = new Map(profile.badges.map((b) => [b.id, b]))
  
  newBadges.forEach((newBadge) => {
    existingBadges.set(newBadge.id, newBadge)
  })

  return {
    ...profile,
    badges: Array.from(existingBadges.values()),
  }
}

// ============================================================================
// Session Scoring Utilities
// ============================================================================

/**
 * Calculate perfect session bonus XP
 * @param sessionStats - Session statistics
 * @returns Bonus XP for perfect session (0 if not perfect)
 */
export const calculatePerfectSessionBonus = (sessionStats: SessionStats): number => {
  if (sessionStats.accuracy === 100 && sessionStats.totalProblems > 0) {
    return XP_REWARDS.perfectSession
  }
  return 0
}

/**
 * Calculate total XP for a session
 * @param sessionStats - Session statistics
 * @param problems - Array of problems
 * @returns Total XP earned in session
 */
export const calculateSessionXP = (
  sessionStats: SessionStats,
  problems: Problem[]
): number => {
  let totalXP = 0
  let currentStreak = 0

  problems.forEach((problem) => {
    const isCorrect = problem.isCorrect === true
    const timeTaken = problem.timeSpent || 0
    const wasPreviousCorrect = currentStreak > 0

    totalXP += calculateXPForProblem(isCorrect, timeTaken, currentStreak)

    if (isCorrect) {
      currentStreak += wasPreviousCorrect ? 1 : 1
    } else {
      currentStreak = 0
    }
  })

  // Add perfect session bonus
  totalXP += calculatePerfectSessionBonus(sessionStats)

  return totalXP
}

// ============================================================================
// Profile Management
// ============================================================================

/**
 * Initialize a new user profile
 * @returns New user profile with default values
 */
export const initializeUserProfile = (): UserProfile => ({
  xp: 0,
  level: 1,
  xpToNextLevel: LEVEL_THRESHOLDS[1] - LEVEL_THRESHOLDS[0],
  badges: initializeBadges(),
  dailyStreak: {
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: '',
    returnBonusClaimed: false,
  },
  settings: {
    soundEnabled: true,
    animationsEnabled: true,
    theme: 'default',
  },
})

/**
 * Load user profile from localStorage
 * @returns User profile (or new profile if not found)
 */
export const loadUserProfile = (): UserProfile => {
  const saved = localStorage.getItem('userProfile')
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      // Validate and migrate if needed
      return {
        xp: parsed.xp || 0,
        level: parsed.level || calculateLevelFromXP(parsed.xp || 0),
        xpToNextLevel: parsed.xpToNextLevel || calculateXPToNextLevel(parsed.xp || 0),
        badges: parsed.badges || initializeBadges(),
        dailyStreak: parsed.dailyStreak || {
          currentStreak: 0,
          longestStreak: 0,
          lastActiveDate: '',
          returnBonusClaimed: false,
        },
        settings: parsed.settings || {
          soundEnabled: true,
          animationsEnabled: true,
          theme: 'default',
        },
      }
    } catch {
      // Fallback to new profile
    }
  }
  return initializeUserProfile()
}

/**
 * Save user profile to localStorage
 * @param profile - User profile to save
 */
export const saveUserProfile = (profile: UserProfile): void => {
  localStorage.setItem('userProfile', JSON.stringify(profile))
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get XP rewards configuration
 * @returns XP rewards object
 */
export const getXPRewards = () => XP_REWARDS

/**
 * Get level thresholds
 * @returns Level thresholds array
 */
export const getLevelThresholds = () => LEVEL_THRESHOLDS

/**
 * Get badge definition by ID
 * @param badgeId - Badge ID
 * @returns Badge definition or undefined
 */
export const getBadgeDefinition = (badgeId: BadgeId): Omit<Badge, 'earned' | 'earnedAt'> | undefined => {
  return BADGE_DEFINITIONS[badgeId]
}

/**
 * Get all badge definitions
 * @returns All badge definitions
 */
export const getAllBadgeDefinitions = () => BADGE_DEFINITIONS
