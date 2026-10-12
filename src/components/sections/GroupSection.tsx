import type { CSSProperties, ReactNode } from 'react'
import { useTranslations } from 'next-intl'

import { GroupBuild } from '@/components/sections/GroupBuild'
import { ActionLink } from '@/components/elements/actions/ActionLink'
import { Container } from '@/components/structures/layout/Container'
import { GROUP_AFFILIATES } from '@/declarations/content'
import { SECTION_ANCHORS } from '@/declarations/routes'
import { GROUP_PANEL_VARIABLES } from '@/declarations/ui/shapes'
import { SECTION_SPACING } from '@/declarations/ui/tokens'
import { GROUP_STYLES } from '@/declarations/ui/variants'
import { ConfigurationService } from '@/services/ConfigurationService'
import type { GroupAffiliate } from '@/types/content'
import { cn } from '@/utils/classnames'

// Build order, left to right
const stepOf = (step: number): CSSProperties => ({ '--build-step': step }) as CSSProperties

// Accent chunk
const accent = (chunks: ReactNode) => <span className={GROUP_STYLES.accent}>{chunks}</span>

export interface GroupSectionProps {
  affiliates?: GroupAffiliate[]
}

/**
 * Animated link between a company and the hub
 * @param {{ reverse?: boolean }} props - Flow direction
 * @return {JSX.Element} - Rendered link
 */

const GroupLink = ({ reverse = false, step }: { reverse?: boolean; step: number }) => (
  <span
    aria-hidden="true"
    style={stepOf(step)}
    className={cn(GROUP_STYLES.link, reverse && GROUP_STYLES.linkReverse, 'build-draw')}
  />
)

/**
 * Orbiting hub, group name at its core
 * @return {JSX.Element} - Rendered hub
 */

const GroupHub = () => {
  const t = useTranslations('sections.group')

  return (
    <div className={cn(GROUP_STYLES.hub, 'build-pop')} style={stepOf(4)}>
      <span aria-hidden="true" className={cn(GROUP_STYLES.ring, 'group-pulse')} />
      <span aria-hidden="true" className={cn(GROUP_STYLES.orbit, 'group-spin')}>
        <span className={cn(GROUP_STYLES.satellite, 'top-0')} />
        <span className={cn(GROUP_STYLES.satellite, 'bottom-0')} />
      </span>
      <span aria-hidden="true" className={cn(GROUP_STYLES.orbitInner, 'group-spin-reverse')}>
        <span className={cn(GROUP_STYLES.satelliteSoon, 'top-0')} />
      </span>
      <div className={GROUP_STYLES.core}>
        <span className={GROUP_STYLES.coreName}>{ConfigurationService.site.group.name}</span>
        <span className={GROUP_STYLES.coreHint}>{t('hub')}</span>
      </div>
    </div>
  )
}

/**
 * Lance Group, affiliated companies around the hub
 * @param {GroupSectionProps} props - Group section props
 * @return {JSX.Element} - Rendered section
 */

export const GroupSection = ({ affiliates = GROUP_AFFILIATES }: GroupSectionProps) => {
  const t = useTranslations('sections.group')

  const card = ({ id, translationKey, url }: GroupAffiliate, step: number, mirror = false) => {
    const key = `affiliates.${translationKey}`

    return (
      <article
        key={id}
        style={stepOf(step)}
        className={cn(
          'build-slide',
          GROUP_STYLES.card,
          mirror && GROUP_STYLES.cardMirror,
          !url && GROUP_STYLES.cardCurrent
        )}>
        <span className={GROUP_STYLES.cardTag}>{t(`${key}.tag`)}</span>
        <h3 className={GROUP_STYLES.cardTitle}>{t(`${key}.title`)}</h3>
        <p className={GROUP_STYLES.cardText}>{t(`${key}.description`)}</p>
        {url ? (
          <ActionLink href={url} icon="external" iconPosition="right">
            {t(`${key}.cta`)}
          </ActionLink>
        ) : (
          <span className={GROUP_STYLES.here}>{t(`${key}.cta`)}</span>
        )}
      </article>
    )
  }

  const [left, right] = affiliates

  return (
    <section id={SECTION_ANCHORS.group} className={SECTION_SPACING.lg}>
      <Container>
        <GroupBuild className={GROUP_STYLES.stage} style={GROUP_PANEL_VARIABLES as CSSProperties}>
          <div className={cn(GROUP_STYLES.panel, 'build-panel')}>
            <div className={cn(GROUP_STYLES.head, 'build-wipe')} style={stepOf(1)}>
              <h2 className={GROUP_STYLES.title}>{t.rich('title', { accent })}</h2>
              <p className={GROUP_STYLES.description}>{t('description')}</p>
            </div>

            <div className={GROUP_STYLES.network}>
              {left && card(left, 2)}
              <GroupLink step={3} />
              <GroupHub />
              <GroupLink reverse step={5} />
              {right && card(right, 6, true)}
            </div>
          </div>

          <p className={cn(GROUP_STYLES.soon, 'build-slide')} style={stepOf(7)}>
            <span aria-hidden="true" className={cn(GROUP_STYLES.soonDot, 'group-blink')} />
            {t('soon')}
          </p>
        </GroupBuild>
      </Container>
    </section>
  )
}
