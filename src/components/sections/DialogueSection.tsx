import type { CSSProperties, ReactNode } from 'react'
import { useTranslations } from 'next-intl'

import { ActionLink } from '@/components/elements/actions/ActionLink'
import { Avatar } from '@/components/elements/data/Avatar'
import { DialogueStage } from '@/components/sections/DialogueStage'
import { GroupBuild } from '@/components/sections/GroupBuild'
import type { DialogueAuthor } from '@/components/sections/DialogueStage'
import { Container } from '@/components/structures/layout/Container'
import { DIALOGUE, DIALOGUE_STEPS, TEAM } from '@/declarations/content'
import { SECTION_ANCHORS } from '@/declarations/routes'
import { DIALOGUE_WINDOW_VARIABLES } from '@/declarations/ui/shapes'
import { SECTION_SPACING } from '@/declarations/ui/tokens'
import { DIALOGUE_STYLES } from '@/declarations/ui/variants'
import { NavigationService } from '@/services/NavigationService'
import type { DialogueLine, TopicItem } from '@/types/content'
import { cn } from '@/utils/classnames'

// Accent chunk
const accent = (chunks: ReactNode) => <span className={DIALOGUE_STYLES.accent}>{chunks}</span>

export interface DialogueSectionProps {
  lines?: DialogueLine[]
  steps?: TopicItem[]
}

/**
 * Process conversation section
 * @param {DialogueSectionProps} props - Dialogue section props
 * @return {JSX.Element} - Rendered section
 */

export const DialogueSection = ({
  lines = DIALOGUE,
  steps = DIALOGUE_STEPS,
}: DialogueSectionProps) => {
  const t = useTranslations('sections.dialogue')
  const team = useTranslations('sections.team')
  const actions = useTranslations('actions')
  const route = NavigationService.callToActionRoute()

  // Client or team member
  const authorOf = (speaker: string): DialogueAuthor => {
    const member = TEAM.find((item) => item.id === speaker)
    if (!member)
      return { name: t('client.name'), role: t('client.role'), portrait: null, isClient: true }

    return {
      name: team(`items.${member.translationKey}.name`),
      role: team(`items.${member.translationKey}.role`),
      portrait: member.portrait,
      isClient: false,
    }
  }

  // Separator on the first line of a step
  const stepOf = (line: DialogueLine, index: number): string | null => {
    const position = steps.findIndex((step) => step.id === line.stepId)
    const step = steps[position]
    if (!step || lines[index - 1]?.stepId === line.stepId) return null

    return t('step', { index: position + 1, label: t(`steps.${step.translationKey}.label`) })
  }

  const header = (
    <div className={DIALOGUE_STYLES.header}>
      <span className={DIALOGUE_STYLES.faces}>
        {TEAM.map((member) => (
          <Avatar
            key={member.id}
            name={team(`items.${member.translationKey}.name`)}
            src={member.portrait}
            size="sm"
            className={DIALOGUE_STYLES.face}
          />
        ))}
      </span>
      <span className={DIALOGUE_STYLES.heading}>
        <span className={DIALOGUE_STYLES.windowTitle}>{t('window.title')}</span>
        <span className={DIALOGUE_STYLES.windowSubtitle}>{t('window.subtitle')}</span>
      </span>
    </div>
  )

  const footer = (
    <div className={DIALOGUE_STYLES.footer}>
      <p className={DIALOGUE_STYLES.prompt}>{t('prompt')}</p>
      <ActionLink route={route} icon="send" className={DIALOGUE_STYLES.cta}>
        {actions(NavigationService.ctaActionOf(route))}
      </ActionLink>
    </div>
  )

  return (
    <section id={SECTION_ANCHORS.dialogue} className={SECTION_SPACING.lg}>
      <Container>
        <GroupBuild
          className={DIALOGUE_STYLES.layout}
          style={DIALOGUE_WINDOW_VARIABLES as CSSProperties}>
          <div className={cn(DIALOGUE_STYLES.head, 'build-wipe')}>
            <h2 className={DIALOGUE_STYLES.title}>{t.rich('title', { accent })}</h2>
            <p className={DIALOGUE_STYLES.description}>{t('description')}</p>
          </div>
          <div className="build-tilt" style={{ '--build-step': 2 } as CSSProperties}>
            <DialogueStage
              header={header}
              footer={footer}
              lines={lines.map((line, index) => ({
                id: line.id,
                text: t(`lines.${line.translationKey}`),
                author: authorOf(line.speaker),
                step: stepOf(line, index),
                attachment: line.attachment
                  ? {
                      label: t(`attachments.${line.attachment.translationKey}`),
                      icon: line.attachment.icon,
                    }
                  : null,
              }))}
            />
          </div>
        </GroupBuild>
      </Container>
    </section>
  )
}
