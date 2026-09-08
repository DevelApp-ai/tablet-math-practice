import { SessionStats, PracticeSession } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, XCircle, Clock, Target, TrendingUp, Calendar, BarChart } from '@phosphor-icons/react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'

interface StatsDashboardProps {
  stats: SessionStats
  history?: PracticeSession[]
}

export function StatsDashboard({ stats, history = [] }: StatsDashboardProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Prepare data for the chart
  const chartData = history
    .slice(-7) // Last 7 sessions
    .reverse()
    .map((session, index) => ({
      name: `Session ${history.length - index}`,
      accuracy: session.stats.accuracy,
      correct: session.stats.correctAnswers,
      total: session.stats.totalProblems
    }))

  const statCards = [
    {
      label: 'Accuracy',
      value: stats.accuracy > 0 ? `${stats.accuracy}%` : 'N/A',
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
      value: stats.averageTime > 0 ? formatTime(stats.averageTime) : 'N/A',
      icon: Clock,
      color: 'text-accent'
    }
  ]
  
  // Add streak card if streak data exists
  if (stats.currentStreak !== undefined) {
    statCards.push({
      label: 'Streak',
      value: stats.currentStreak > 0 ? stats.currentStreak : 0,
      icon: TrendingUp,
      color: 'text-success'
    })
  }

  // Calculate overall stats from history
  const totalSessions = history.length
  const avgAccuracy = history.length > 0
    ? Math.round(history.reduce((sum, s) => sum + s.stats.accuracy, 0) / history.length)
    : 0
  const totalProblemsSolved = history.reduce((sum, s) => sum + s.stats.correctAnswers + s.stats.incorrectAnswers, 0)

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
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

      {/* Stat Cards */}
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

      {/* Historical Chart - Only show if there's history */}
      {history.length > 1 && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={20} className="text-primary" weight="duotone" />
              <h3 className="text-lg font-semibold">Accuracy Over Time</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="accuracy"
                    name="Accuracy %"
                    stroke="var(--color-primary)"
                    strokeWidth={3}
                    dot={{ r: 6 }}
                    activeDot={{ r: 8, fill: 'var(--color-primary)' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      )}

      {/* Overall Stats Summary */}
      {history.length > 0 && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <BarChart size={20} className="text-accent" weight="duotone" />
              <h3 className="text-lg font-semibold">Overall Performance</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-secondary/30 rounded-lg">
                <div className="text-3xl font-bold">{totalSessions}</div>
                <div className="text-sm text-muted-foreground">Total Sessions</div>
              </div>
              <div className="text-center p-4 bg-secondary/30 rounded-lg">
                <div className="text-3xl font-bold">{avgAccuracy}%</div>
                <div className="text-sm text-muted-foreground">Avg Accuracy</div>
              </div>
              <div className="text-center p-4 bg-secondary/30 rounded-lg">
                <div className="text-3xl font-bold">{totalProblemsSolved}</div>
                <div className="text-sm text-muted-foreground">Total Problems</div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
