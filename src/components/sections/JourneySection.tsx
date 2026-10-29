import type { CSSProperties, ReactNode } from 'react'
import { useTranslations } from 'next-intl'

import { ActionLink } from '@/components/elements/actions/ActionLink'
import { Icon } from '@/components/elements/media/Icon'
import { Picture } from '@/components/elements/media/Picture'
import { GroupBuild } from '@/components/sections/GroupBuild'
import { Container } from '@/components/structures/layout/Container'
import { JOURNEY_STEPS } from '@/declarations/content'
import { SECTION_ANCHORS } from '@/declarations/routes'
import { JOURNEY_PANEL_VARIABLES } from '@/declarations/ui/shapes'
import { SECTION_SPACING } from '@/declarations/ui/tokens'
import { JOURNEY_STYLES } from '@/declarations/ui/variants'
import { ConfigurationService } from '@/services/ConfigurationService'
import { NavigationService } from '@/services/NavigationService'
import type { JourneyStep } from '@/types/content'
import { cn } from '@/utils/classnames'

const { md, lg } = ConfigurationService.viewport.breakpoints

// Photograph widths: full column, half, then a third of the rail
const PICTURE_SIZES = `(max-width: ${md}px) 100vw, (max-width: ${lg}px) 50vw, 26rem`

// Build order, item by item
const stepOf = (step: number): CSSProperties => ({ '--build-step': step }) as CSSProperties

// Accent chunk
const accent = (chunks: ReactNode) => <span className={JOURNEY_STYLES.accent}>{chunks}</span>

export interface JourneySectionProps {
  steps?: JourneyStep[]
}

/**
 * Project journey, step by step from the brief to the partnership
 * @param {JourneySectionProps} props - Journey section props
 * @return {JSX.Element} - Rendered section
 */

export const JourneySection = ({ steps = JOURNEY_STEPS }: JourneySectionProps) => {
  const t = useTranslations('sections.journey')
  const actions = useTranslations('actions')
  const route = NavigationService.callToActionRoute()

  return (
    <section id={SECTION_ANCHORS.journey} className={SECTION_SPACING.lg}>
      <Container>
        <GroupBuild
          className={JOURNEY_STYLES.stage}
          style={JOURNEY_PANEL_VARIABLES as CSSProperties}>
          <div data-scheme="dark" className={cn(JOURNEY_STYLES.panel, 'build-iris')}>
            <p className={JOURNEY_STYLES.kicker}>{t('kicker')}</p>
            <div className={cn(JOURNEY_STYLES.head, 'build-wipe')} style={stepOf(1)}>
              <h2 className={JOURNEY_STYLES.title}>{t.rich('title', { accent })}</h2>
              <p className={JOURNEY_STYLES.description}>{t('description')}</p>
            </div>

            <div className={JOURNEY_STYLES.trail}>
              <span aria-hidden="true" className={JOURNEY_STYLES.thread} />
              <ol className={JOURNEY_STYLES.route}>
                {steps.map((step, index) => {
                  const key = `items.${step.translationKey}`

                  return (
                    <li
                      key={step.id}
                      style={stepOf(index + 2)}
                      className={cn(JOURNEY_STYLES.step, 'build-rise')}>
                      <span aria-hidden="true" className={JOURNEY_STYLES.number}>
                        {index + 1}
                      </span>
                      <span aria-hidden="true" className={JOURNEY_STYLES.link} />
                      <article className={JOURNEY_STYLES.card}>
                        <div className={JOURNEY_STYLES.media}>
                          <Picture
                            src={step.src}
                            alt={t(`${key}.alt`)}
                            ratio="strip"
                            sizes={PICTURE_SIZES}
                            className={JOURNEY_STYLES.picture}
                          />
                          <span aria-hidden="true" className={JOURNEY_STYLES.badge}>
                            <Icon name={step.icon} />
                          </span>
                        </div>
                        <div className={JOURNEY_STYLES.body}>
                          <h3 className={JOURNEY_STYLES.term}>{t(`${key}.title`)}</h3>
                          <p className={JOURNEY_STYLES.definition}>{t(`${key}.description`)}</p>
                        </div>
                      </article>
                    </li>
                  )
                })}
              </ol>
            </div>
          </div>

          <div className={cn(JOURNEY_STYLES.action, 'build-rise')} style={stepOf(steps.length + 2)}>
            <ActionLink route={route} size="sm">
              {actions(NavigationService.ctaActionOf(route))}
            </ActionLink>
            <p className={JOURNEY_STYLES.note}>{t('note')}</p>
          </div>
        </GroupBuild>
      </Container>
    </section>
  )
}
