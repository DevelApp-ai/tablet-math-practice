import { PracticeSession } from '@/lib/types'
import { StatsDashboard } from '@/components/StatsDashboard'
import { Button } from '@/components/ui/button'
import { StrokeReplayViewer } from '@/components/canvas/StrokeReplayViewer'
import { StrokeSession } from '@/lib/ink/strokeStore'
import { useTranslation } from 'react-i18next'

interface StatsScreenProps {
  session: PracticeSession
  history: PracticeSession[]
  strokeSessions: Record<string, StrokeSession>
  replayProblemId: string | null
  onSelectReplay: (problemId: string | null) => void
  onNewSession: () => void
  onRestart: () => void
}

export function StatsScreen({
  session,
  history,
  strokeSessions,
  replayProblemId,
  onSelectReplay,
  onNewSession,
  onRestart,
}: StatsScreenProps) {
  const { t } = useTranslation()

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">{t('feedback.sessionComplete')} 🎉</h2>
        <p className="text-muted-foreground">{t('stats.howYouDid')}</p>
      </div>

      <StatsDashboard stats={session.stats} history={history} />

      {Object.keys(strokeSessions).length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-center">{t('stats.strokeReplay')}</h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {session.problems
              .filter((p) => strokeSessions[p.id])
              .map((p, idx) => (
                <Button
                  key={p.id}
                  variant={replayProblemId === p.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onSelectReplay(p.id)}
                >
                  {t('stats.problemN', { n: idx + 1 })}
                </Button>
              ))}
          </div>
          {replayProblemId && strokeSessions[replayProblemId] && (
            <div className="max-w-2xl mx-auto">
              <StrokeReplayViewer session={strokeSessions[replayProblemId]} />
            </div>
          )}
        </div>
      )}

      <div className="flex gap-4 justify-center">
        <Button onClick={onNewSession} size="lg" className="gap-2">
          {t('stats.practiceAgain')}
        </Button>
        <Button onClick={onRestart} variant="outline" size="lg">
          {t('stats.changeSettings')}
        </Button>
      </div>
    </div>
  )
}
