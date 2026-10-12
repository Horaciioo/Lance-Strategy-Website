import type { ReactNode } from 'react'
import { useTranslations } from 'next-intl'

import { ActionLink } from '@/components/elements/actions/ActionLink'
import { Avatar } from '@/components/elements/data/Avatar'
import { Text } from '@/components/elements/typography/Text'
import { Container } from '@/components/structures/layout/Container'
import { HERO_COUNTRIES, TEAM } from '@/declarations/content'
import { SECTION_ANCHORS } from '@/declarations/routes'
import { STORY_STYLES } from '@/declarations/ui/variants'
import { NavigationService } from '@/services/NavigationService'
import type { Styleable } from '@/types/common'
import type { RouteId } from '@/types/navigation'
import { cn } from '@/utils/classnames'

// Rich text chunks
const accent = (chunks: ReactNode) => <span className={STORY_STYLES.accent}>{chunks}</span>
const strong = (chunks: ReactNode) => <strong className={STORY_STYLES.introStrong}>{chunks}</strong>

export interface StorySectionProps extends Styleable {
  // Primary CTA route
  primaryRoute?: RouteId
}

/**
 * Story book section
 * @param {StorySectionProps} props - Story section props
 * @return {JSX.Element} - Rendered section
 */

export const StorySection = ({ primaryRoute, className }: StorySectionProps) => {
  const t = useTranslations('sections.hero')
  const story = useTranslations('sections.story')
  const team = useTranslations('sections.team')
  const actions = useTranslations('actions')
  const navigation = useTranslations('navigation.sections')
  const primary = primaryRoute ?? NavigationService.callToActionRoute()

  return (
    <section id={SECTION_ANCHORS.story} className={cn(STORY_STYLES.section, className)}>
      <Container>
        <div className={STORY_STYLES.head}>
          <Text className={STORY_STYLES.intro}>{t.rich('intro', { strong })}</Text>
          <Text appearance="display" as="h2" className={STORY_STYLES.title}>
            <span className={STORY_STYLES.titleLead}>{story.rich('titleLead', { accent })}</span>{' '}
            <span className={STORY_STYLES.titleTail}>{story.rich('titleTail', { accent })}</span>
          </Text>
          <Text className={STORY_STYLES.description}>{t('description')}</Text>
        </div>

        <div className={STORY_STYLES.stage}>
          <div className={STORY_STYLES.actions}>
            <ActionLink route={primary}>
              {actions(NavigationService.ctaActionOf(primary))}
            </ActionLink>
            <ActionLink href={NavigationService.anchorOf('offers')} variant="ghost">
              {navigation('offers')}
            </ActionLink>
          </div>

          <div className={STORY_STYLES.pills}>
            <div className={STORY_STYLES.pill}>
              <span className={STORY_STYLES.faces}>
                {TEAM.map((member) => (
                  <Avatar
                    key={member.id}
                    name={team(`items.${member.translationKey}.name`)}
                    src={member.portrait}
                    size="sm"
                    className={STORY_STYLES.face}
                  />
                ))}
              </span>
              {t('pills.team')}
            </div>
            <div className={STORY_STYLES.pill}>
              {t('pills.countries', { count: HERO_COUNTRIES.length })}
              <span className={STORY_STYLES.faces}>
                {HERO_COUNTRIES.map((country) => (
                  <span
                    key={country.id}
                    role="img"
                    aria-label={t(`countries.${country.translationKey}`)}
                    className={cn(STORY_STYLES.face, STORY_STYLES.flag)}>
                    {country.flag}
                  </span>
                ))}
              </span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
