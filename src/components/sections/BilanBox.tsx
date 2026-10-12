import type { CSSProperties } from 'react'
import { useTranslations } from 'next-intl'

import { ActionLink } from '@/components/elements/actions/ActionLink'
import { QUOTE_CHANNELS } from '@/declarations/content'
import { BILAN_BOX_VARIABLES } from '@/declarations/ui/shapes'
import { BILAN_STYLES } from '@/declarations/ui/variants'
import { ConfigurationService } from '@/services/ConfigurationService'
import { NavigationService } from '@/services/NavigationService'
import { mailLinkOf, whatsappLinkOf } from '@/utils/contact'

const { email, whatsapp } = ConfigurationService.identity

/**
 * Free assessment box, revealed behind the towed banner
 * @return {JSX.Element} - Rendered box
 */

export const BilanBox = () => {
  const t = useTranslations('sections.quote')

  const hrefOf = (kind: 'whatsapp' | 'email', key: string): string =>
    kind === 'whatsapp'
      ? whatsappLinkOf(whatsapp, t(`channels.${key}.message`))
      : mailLinkOf(email, t(`channels.${key}.subject`))

  return (
    <div className={BILAN_STYLES.frame} style={BILAN_BOX_VARIABLES as CSSProperties}>
      <div className={BILAN_STYLES.body}>
        <p className={BILAN_STYLES.kicker}>{t('kicker')}</p>
        <h2 className={BILAN_STYLES.title}>{t('title')}</h2>
        <p className={BILAN_STYLES.description}>{t('description')}</p>
        <div className={BILAN_STYLES.channels}>
          <ActionLink
            href={NavigationService.anchorOf('booking')}
            icon="arrowRight"
            iconPosition="right"
            variant="onMedia"
            size="lg">
            {t('cta')}
          </ActionLink>
          {QUOTE_CHANNELS.map((channel) => (
            <ActionLink
              key={channel.id}
              href={hrefOf(channel.kind, channel.translationKey)}
              icon={channel.icon}
              variant="onMediaOutline"
              size="lg">
              {t(`channels.${channel.translationKey}.label`)}
            </ActionLink>
          ))}
        </div>
      </div>
    </div>
  )
}
