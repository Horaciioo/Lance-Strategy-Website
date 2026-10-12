import { useTranslations } from 'next-intl'

import { ActionLink } from '@/components/elements/actions/ActionLink'
import { Heading } from '@/components/elements/typography/Heading'
import { Text } from '@/components/elements/typography/Text'
import { Container } from '@/components/structures/layout/Container'
import { Accordion } from '@/components/structures/overlays/Accordion'
import { FAQ } from '@/declarations/content'
import { SECTION_ANCHORS } from '@/declarations/routes'
import { SECTION_SPACING } from '@/declarations/ui/tokens'
import { FAQ_STYLES } from '@/declarations/ui/variants'
import { NavigationService } from '@/services/NavigationService'
import type { FaqItem } from '@/types/content'

export interface FaqSectionProps {
  items?: FaqItem[]
}

/**
 * FAQ section
 * @param {FaqSectionProps} props - FAQ section props
 * @return {JSX.Element} - Rendered section
 */

export const FaqSection = ({ items = FAQ }: FaqSectionProps) => {
  const t = useTranslations('sections.faq')
  const actions = useTranslations('actions')
  const route = NavigationService.callToActionRoute()

  return (
    <section id={SECTION_ANCHORS.faq} className={SECTION_SPACING.lg}>
      <Container>
        <div className={FAQ_STYLES.panel}>
          <div className={FAQ_STYLES.grid}>
            <div className={FAQ_STYLES.aside}>
              <Heading level={2}>{t('title')}</Heading>
              <Text appearance="description">{t('description')}</Text>
              <ActionLink route={route} variant="outline" icon="arrowRight" iconPosition="right">
                {actions(NavigationService.ctaActionOf(route))}
              </ActionLink>
            </div>
            <Accordion
              name="faq"
              className={FAQ_STYLES.list}
              entries={items.map((item) => ({
                id: item.id,
                title: t(`items.${item.translationKey}.question`),
                content: t(`items.${item.translationKey}.answer`),
              }))}
            />
          </div>
        </div>
      </Container>
    </section>
  )
}
