/**
 * Streak Display Component
 * Shows current and longest streaks
 */

import { UserProfile, SessionStats } from '../../lib/types'

interface StreakDisplayProps {
  profile: UserProfile
  sessionStats?: SessionStats
  className?: string
}

export const StreakDisplay = ({
  profile,
  sessionStats,
  className = '',
}: StreakDisplayProps) => {
  const { dailyStreak, badges } = profile
  
  // Get session streak or use profile streak
  const currentStreak = sessionStats?.currentStreak || 0
  const longestStreak = Math.max(
    sessionStats?.longestStreak || 0,
    dailyStreak.longestStreak
  )

  // Check if user has streak badges
  const hasPerfect10 = badges.some(b => b.id === 'perfect_10' && b.earned)
  const hasPerfect25 = badges.some(b => b.id === 'perfect_25' && b.earned)
  const hasPerfect50 = badges.some(b => b.id === 'perfect_50' && b.earned)

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">🔥</span>
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Current Streak
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {currentStreak}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Longest Streak
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {longestStreak}
            </div>
          </div>
          <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">🏆</span>
          </div>
        </div>
      </div>

      {/* Streak achievements */}
      <div className="mt-2 flex gap-1">
        {hasPerfect10 && (
          <span
            className="text-xs bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-full"
            title="Perfect 10 streak achieved"
          >
            10🔥
          </span>
        )}
        {hasPerfect25 && (
          <span
            className="text-xs bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 px-2 py-0.5 rounded-full"
            title="Perfect 25 streak achieved"
          >
            25🔥
          </span>
        )}
        {hasPerfect50 && (
          <span
            className="text-xs bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full"
            title="Perfect 50 streak achieved"
          >
            50🔥
          </span>
        )}
      </div>

      {/* Daily streak info */}
      {dailyStreak.currentStreak > 0 && (
        <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="text-xs text-blue-700 dark:text-blue-300">
            📅 Daily Streak: {dailyStreak.currentStreak} day{dailyStreak.currentStreak !== 1 ? 's' : ''}
          </div>
          {dailyStreak.currentStreak >= 5 && (
            <div className="text-xs text-blue-500 mt-0.5">
              Keep it up! {30 - dailyStreak.currentStreak} more days for Month Streak badge
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default StreakDisplay
