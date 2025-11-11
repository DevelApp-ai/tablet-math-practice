import { SessionStats } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, XCircle, Clock, Target } from '@phosphor-icons/react'

interface StatsDashboardProps {
  stats: SessionStats
}

export function StatsDashboard({ stats }: StatsDashboardProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const statCards = [
    {
      label: 'Accuracy',
      value: `${stats.accuracy}%`,
      icon: Target,
      color: 'text-primary'
    },
    {
      label: 'Correct',
      value: stats.correctAnswers,
      icon: CheckCircle,
      color: 'text-success'
    },
    {
      label: 'Incorrect',
      value: stats.incorrectAnswers,
      icon: XCircle,
      color: 'text-destructive'
    },
    {
      label: 'Avg Time',
      value: formatTime(Math.round(stats.averageTime)),
      icon: Clock,
      color: 'text-accent'
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Progress</span>
          <span className="text-sm text-muted-foreground">
            {stats.correctAnswers + stats.incorrectAnswers} / {stats.totalProblems}
          </span>
        </div>
        <Progress 
          value={((stats.correctAnswers + stats.incorrectAnswers) / stats.totalProblems) * 100} 
          className="h-3"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="p-4">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center gap-2">
                  <Icon size={20} className={stat.color} weight="duotone" />
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                </div>
                <span className="text-2xl font-bold">{stat.value}</span>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
