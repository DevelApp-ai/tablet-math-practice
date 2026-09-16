import { DifficultyLevel } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Brain, RocketLaunch, Lightning } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

interface DifficultySelectProps {
  onSelect: (difficulty: DifficultyLevel, problemCount?: number) => void
}

const difficulties = [
  {
    level: 'beginner' as DifficultyLevel,
    icon: Brain,
    color: 'text-success'
  },
  {
    level: 'intermediate' as DifficultyLevel,
    icon: RocketLaunch,
    color: 'text-accent'
  },
  {
    level: 'advanced' as DifficultyLevel,
    icon: Lightning,
    color: 'text-primary'
  }
]

export function DifficultySelect({ onSelect }: DifficultySelectProps) {
  const { t } = useTranslation()
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">{t('difficulty.chooseLevel')}</h2>
        <p className="text-muted-foreground">{t('difficulty.selectHint')}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {difficulties.map((diff, index) => {
          const Icon = diff.icon
          return (
            <motion.div
              key={diff.level}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className="p-6 cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 border-2 hover:border-primary"
                onClick={() => onSelect(diff.level, 10)}
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className={`${diff.color} bg-secondary/30 p-4 rounded-full`}>
                    <Icon size={40} weight="duotone" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">{t(`difficulty.${diff.level}`)}</h3>
                    <p className="text-sm text-muted-foreground">{t(`difficultyDesc.${diff.level}`)}</p>
                  </div>
                  <Badge variant="secondary" className="mt-2">
                    {t('difficulty.tapToStart')}
                  </Badge>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
