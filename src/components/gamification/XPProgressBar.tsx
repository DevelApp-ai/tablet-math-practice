/**
 * XP Progress Bar Component
 * Displays user's XP and progress towards next level
 */

import { UserProfile } from '../../lib/types'

interface XPProgressBarProps {
  profile: UserProfile
  className?: string
}

export const XPProgressBar = ({ profile, className = '' }: XPProgressBarProps) => {
  const { xp, level, xpToNextLevel } = profile
  
  // Calculate percentage towards next level
  const levelThresholds = [0, 100, 250, 500, 1000, 2000, 4000, 8000, 16000]
  const currentLevelThreshold = levelThresholds[level - 1] || 0
  const nextLevelThreshold = levelThresholds[level] || levelThresholds[levelThresholds.length - 1]
  const xpInCurrentLevel = xp - currentLevelThreshold
  const xpNeededForLevel = nextLevelThreshold - currentLevelThreshold
  const progressPercent = (xpInCurrentLevel / xpNeededForLevel) * 100

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            Level {level}
          </span>
        </div>
        <div className="text-sm font-medium text-muted-foreground">
          {xp.toLocaleString()} XP
        </div>
      </div>
      
      <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
        <div
          className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.min(progressPercent, 100)}%` }}
        />
      </div>
      
      <div className="flex justify-between mt-1">
        <span className="text-xs text-muted-foreground">
          {currentLevelThreshold.toLocaleString()} XP
        </span>
        <span className="text-xs text-muted-foreground">
          {nextLevelThreshold.toLocaleString()} XP
        </span>
      </div>
      
      {xpToNextLevel > 0 && (
        <p className="text-xs text-muted-foreground mt-1 text-center">
          {xpToNextLevel.toLocaleString()} XP to Level {level + 1}
        </p>
      )}
    </div>
  )
}

export default XPProgressBar
