import type { CSSProperties, ReactNode } from 'react'
import { useTranslations } from 'next-intl'

import { ActionLink } from '@/components/elements/actions/ActionLink'
import { Icon } from '@/components/elements/media/Icon'
import { GroupBuild } from '@/components/sections/GroupBuild'
import { Container } from '@/components/structures/layout/Container'
import { FEATURES } from '@/declarations/content'
import { SECTION_ANCHORS } from '@/declarations/routes'
import { REASONS_PANEL_VARIABLES } from '@/declarations/ui/shapes'
import { SECTION_SPACING } from '@/declarations/ui/tokens'
import { REASONS_STYLES } from '@/declarations/ui/variants'
import { ConfigurationService } from '@/services/ConfigurationService'
import { NavigationService } from '@/services/NavigationService'
import type { FeatureItem } from '@/types/content'
import { cn } from '@/utils/classnames'

// Build order, item by item
const stepOf = (step: number): CSSProperties => ({ '--build-step': step }) as CSSProperties

// Accent chunk
const accent = (chunks: ReactNode) => <span className={REASONS_STYLES.accent}>{chunks}</span>

export interface FeatureSectionProps {
  items?: FeatureItem[]
}

/**
 * Reasons section
 * @param {FeatureSectionProps} props - Feature section props
 * @return {JSX.Element} - Rendered section
 */

export const FeatureSection = ({ items = FEATURES }: FeatureSectionProps) => {
  const t = useTranslations('sections.features')
  const actions = useTranslations('actions')
  const route = NavigationService.callToActionRoute()

  return (
    <section id={SECTION_ANCHORS.features} className={SECTION_SPACING.lg}>
      <Container>
        <GroupBuild
          className={REASONS_STYLES.stage}
          style={REASONS_PANEL_VARIABLES as CSSProperties}>
          <div data-scheme="dark" className={cn(REASONS_STYLES.panel, 'build-iris')}>
            <div className={cn(REASONS_STYLES.head, 'build-wipe')} style={stepOf(1)}>
              <h2 className={REASONS_STYLES.title}>
                {t.rich('title', { accent, name: ConfigurationService.site.name })}
              </h2>
              <p className={REASONS_STYLES.description}>{t('description')}</p>
            </div>

            <ul className={REASONS_STYLES.list}>
              {items.map((item, index) => (
                <li
                  key={item.id}
                  style={stepOf(index + 2)}
                  className={cn(REASONS_STYLES.item, 'build-rise')}>
                  <Icon name={item.icon} className={REASONS_STYLES.icon} />
                  <h3 className={REASONS_STYLES.term}>{t(`items.${item.translationKey}.title`)}</h3>
                  <p className={REASONS_STYLES.definition}>
                    {t(`items.${item.translationKey}.description`)}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div className={cn(REASONS_STYLES.action, 'build-rise')} style={stepOf(items.length + 2)}>
            <ActionLink route={route} size="sm">
              {actions(NavigationService.ctaActionOf(route))}
            </ActionLink>
            <p className={REASONS_STYLES.note}>{t('note')}</p>
          </div>
        </GroupBuild>
      </Container>
    </section>
  )
}
