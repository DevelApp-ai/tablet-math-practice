/**
 * Badge Display Component
 * Displays earned badges and badge progress
 */

import { useState } from 'react'
import { UserProfile } from '../../lib/types'
import { getBadgeDefinition } from '../../lib/scoring'

interface BadgeDisplayProps {
  profile: UserProfile
  className?: string
  showOnlyEarned?: boolean
}

export const BadgeDisplay = ({
  profile,
  className = '',
  showOnlyEarned = false,
}: BadgeDisplayProps) => {
  const [expanded, setExpanded] = useState(false)

  // Get all badges
  const allBadges = profile.badges

  // Filter badges based on props
  const displayedBadges = showOnlyEarned
    ? allBadges.filter((b) => b.earned)
    : allBadges

  // Count earned badges
  const earnedCount = allBadges.filter((b) => b.earned).length
  const totalCount = allBadges.length

  // Toggle expansion
  const toggleExpanded = () => setExpanded(!expanded)

  return (
    <div className={`w-full ${className}`}>
      <button
        onClick={toggleExpanded}
        className="w-full flex items-center justify-between p-3 bg-card rounded-lg shadow-sm border border-border hover:bg-muted transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">🏆</span>
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold text-foreground">
              Badges
            </div>
            <div className="text-xs text-muted-foreground">
              {earnedCount} of {totalCount} earned
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {expanded ? (
            <span className="text-sm text-muted-foreground">Hide</span>
          ) : (
            <span className="text-sm text-primary">
              View All
            </span>
          )}
          <svg
            className={`w-4 h-4 text-muted-foreground transition-transform ${
              expanded ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="mt-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {displayedBadges.map((badge) => {
            const definition = getBadgeDefinition(badge.id)
            return (
              <div
                key={badge.id}
                className={`p-3 rounded-lg border-2 transition-all ${
                  badge.earned
                    ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/10'
                    : 'border-border bg-muted opacity-60'
                }`}
                title={definition?.description || badge.name}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-lg">{definition?.icon || '🏆'}</span>
                  {badge.earned && (
                    <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full font-semibold">
                      Earned
                    </span>
                  )}
                </div>
                <div className="text-xs font-medium text-foreground truncate">
                  {definition?.name || badge.name}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {definition?.description || ''}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default BadgeDisplay
