import { DifficultyLevel, OperationType, SessionMode, UserProfile } from '@/lib/types'
import { DifficultySelect } from '@/components/DifficultySelect'
import { OperationSelect } from '@/components/OperationSelect'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge as UIBadge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CanvasGridSelector } from '@/components/canvas/CanvasGridSelector'
import { Vault, Target, Gauge, ChartBar } from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'
import type { SettingsPatch } from '@/hooks/usePracticeSession'

interface LandingScreenProps {
  profile: UserProfile
  operationType: OperationType
  sessionMode: SessionMode
  vaultCount: number
  hasHistory: boolean
  onStartSession: (difficulty: DifficultyLevel, problemCount?: number) => void
  onSelectOperation: (operation: OperationType) => void
  onChangeSessionMode: (mode: SessionMode) => void
  onChangeSettings: (patch: SettingsPatch) => void
  onChangePresentationMode: (mode: UserProfile['settings']['presentationMode']) => void
  onOpenVault: () => void
  onViewStats: () => void
}

export function LandingScreen({
  profile,
  operationType,
  sessionMode,
  vaultCount,
  hasHistory,
  onStartSession,
  onSelectOperation,
  onChangeSessionMode,
  onChangeSettings,
  onChangePresentationMode,
  onOpenVault,
  onViewStats,
}: LandingScreenProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-8">
      <DifficultySelect onSelect={onStartSession} />

      <Separator className="my-8" />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-center">{t('landing.practiceSettings')}</h3>
        <OperationSelect selected={operationType} onSelect={onSelectOperation} />

        <div className="flex flex-col items-center gap-2 pt-4">
          <Label className="text-base font-medium">{t('landing.sessionMode')}</Label>
          <div className="flex items-center gap-2">
            <Button
              variant={sessionMode === 'mastery' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onChangeSessionMode('mastery')}
              className="gap-1"
            >
              <Target size={16} />
              {t('landing.mastery')}
            </Button>
            <Button
              variant={sessionMode === 'fluency' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onChangeSessionMode('fluency')}
              className="gap-1"
            >
              <Gauge size={16} />
              {t('landing.fluency')}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center max-w-md">
            {t('landing.modeDescription')}
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-4">
          <Switch
            id="vertical-mode"
            checked={profile.settings.presentationMode === 'vertical'}
            onCheckedChange={(checked) => onChangePresentationMode(checked ? 'vertical' : 'horizontal')}
          />
          <Label htmlFor="vertical-mode" className="text-base cursor-pointer">
            {t('landing.verticalLayout')}
          </Label>
        </div>

        <div className="flex items-center justify-center gap-3 pt-4">
          <Switch
            id="manipulatives-mode"
            checked={profile.settings.manipulativesEnabled}
            onCheckedChange={(checked) => onChangeSettings({ manipulativesEnabled: checked })}
          />
          <Label htmlFor="manipulatives-mode" className="text-base cursor-pointer">
            {t('landing.manipulatives')}
          </Label>
        </div>

        <div className="flex items-center justify-center gap-3 pt-4">
          <Switch
            id="word-problems-mode"
            checked={profile.settings.wordProblemsEnabled}
            onCheckedChange={(checked) => onChangeSettings({ wordProblemsEnabled: checked })}
          />
          <Label htmlFor="word-problems-mode" className="text-base cursor-pointer">
            {t('landing.wordProblems')}
          </Label>
        </div>

        <div className="flex items-center justify-center gap-3 pt-4">
          <Switch
            id="scratchpad-mode"
            checked={profile.settings.scratchpadEnabled}
            onCheckedChange={(checked) => onChangeSettings({ scratchpadEnabled: checked })}
          />
          <Label htmlFor="scratchpad-mode" className="text-base cursor-pointer">
            {t('landing.scratchpad')}
          </Label>
        </div>

        <div className="flex items-center justify-center gap-3 pt-4">
          <Switch
            id="palm-rejection"
            checked={profile.settings.palmRejection}
            onCheckedChange={(checked) => onChangeSettings({ palmRejection: checked })}
          />
          <Label htmlFor="palm-rejection" className="text-base cursor-pointer">
            {t('landing.palmRejection')}
          </Label>
        </div>

        <div className="pt-4 flex justify-center">
          <CanvasGridSelector
            value={profile.settings.canvasBackground}
            onChange={(background) => onChangeSettings({ canvasBackground: background })}
          />
        </div>
      </div>

      <Separator className="my-8" />
      <div className="text-center">
        <Button variant="outline" onClick={onOpenVault} className="gap-2">
          <Vault size={20} />
          {t('landing.mistakeVault')}
          {vaultCount > 0 && (
            <UIBadge variant="destructive" className="ml-1">
              {vaultCount}
            </UIBadge>
          )}
        </Button>
      </div>

      {hasHistory && (
        <>
          <Separator className="my-8" />
          <div className="text-center">
            <Button variant="outline" onClick={onViewStats} className="gap-2">
              <ChartBar size={20} />
              {t('landing.viewPreviousSessions')}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
