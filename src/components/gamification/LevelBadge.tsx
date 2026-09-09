/**
 * Level Badge Component
 * Displays user's current level with visual styling
 */

import { UserProfile } from '../../lib/types'

interface LevelBadgeProps {
  profile: UserProfile
  className?: string
  showLabel?: boolean
}

// Level colors - can be extended with themes
const LEVEL_COLORS = [
  'bg-gray-500',    // Level 1
  'bg-blue-500',    // Level 2
  'bg-green-500',   // Level 3
  'bg-yellow-500',  // Level 4
  'bg-orange-500',  // Level 5
  'bg-red-500',     // Level 6
  'bg-purple-500',  // Level 7
  'bg-pink-500',    // Level 8
  'bg-indigo-500',  // Level 9+
]

// Level icons
const LEVEL_ICONS = [
  '⭐',    // Level 1
  '⭐⭐',   // Level 2
  '⭐⭐⭐',  // Level 3
  '⭐⭐⭐⭐', // Level 4
  '⭐⭐⭐⭐⭐',// Level 5
]

export const LevelBadge = ({
  profile,
  className = '',
  showLabel = true,
}: LevelBadgeProps) => {
  const { level } = profile
  const colorIndex = Math.min(Math.max(level - 1, 0), LEVEL_COLORS.length - 1)
  const colorClass = LEVEL_COLORS[colorIndex]
  const iconIndex = Math.min(Math.max(level - 1, 0), LEVEL_ICONS.length - 1)
  const icon = LEVEL_ICONS[iconIndex]

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className={`w-10 h-10 rounded-full ${colorClass} flex items-center justify-center text-white font-bold shadow-lg`}
        title={`Level ${level}`}
      >
        <span className="text-lg">{level}</span>
      </div>
      {showLabel && (
        <div>
          <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            Level {level}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {icon}
          </div>
        </div>
      )}
    </div>
  )
}

export default LevelBadge
