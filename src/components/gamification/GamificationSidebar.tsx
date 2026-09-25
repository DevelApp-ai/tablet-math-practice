import { Button } from '@/components/ui/button'
import { LevelBadge } from '@/components/gamification/LevelBadge'
import { XPProgressBar } from '@/components/gamification/XPProgressBar'
import { BadgeDisplay } from '@/components/gamification/BadgeDisplay'
import { StreakDisplay } from '@/components/gamification/StreakDisplay'
import { SessionStats, UserProfile } from '@/lib/types'
import { useTranslation } from 'react-i18next'

interface GamificationSidebarProps {
  profile: UserProfile
  sessionStats: SessionStats
  onClose: () => void
}

export function GamificationSidebar({ profile, sessionStats, onClose }: GamificationSidebarProps) {
  const { t } = useTranslation()

  return (
    <>
      <div className="fixed top-0 right-0 z-50 w-80 h-full bg-card shadow-2xl transform translate-x-0 transition-transform duration-300 ease-in-out no-print">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">{t('gamification.title')}</h2>
            <Button variant="ghost" size="sm" onClick={onClose} className="p-1">
              <span className="text-xl">×</span>
            </Button>
          </div>

          {/* User Profile Summary */}
          <div className="space-y-4">
            <LevelBadge profile={profile} showLabel={false} />
            <XPProgressBar profile={profile} />
            <StreakDisplay profile={profile} sessionStats={sessionStats} />
            <BadgeDisplay profile={profile} showOnlyEarned={true} />
          </div>
        </div>
      </div>

      {/* Overlay for gamification panel */}
      <div className="fixed inset-0 bg-black/50 z-40 no-print" onClick={onClose} />
    </>
  )
}
