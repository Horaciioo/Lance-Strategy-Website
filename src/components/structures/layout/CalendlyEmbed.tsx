'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

import { ActionLink } from '@/components/elements/actions/ActionLink'
import { Button } from '@/components/elements/actions/Button'
import { CALENDLY_STYLES } from '@/declarations/ui/variants'
import { ConfigurationService } from '@/services/ConfigurationService'
import type { Styleable } from '@/types/common'
import { cn } from '@/utils/classnames'

export interface CalendlyEmbedProps extends Styleable {
  url: string
}

// Inline widget parameters, no consent banner of its own
const embedUrlOf = (url: string): string => {
  const link = new URL(url)
  link.searchParams.set('embed_domain', ConfigurationService.site.domain)
  link.searchParams.set('embed_type', 'Inline')
  link.searchParams.set('hide_gdpr_banner', '1')

  return link.toString()
}

/**
 * Calendly calendar, loaded on demand
 * @param {CalendlyEmbedProps} props - Embed props
 * @return {JSX.Element} - Rendered embed
 */

export const CalendlyEmbed = ({ url, className }: CalendlyEmbedProps) => {
  const t = useTranslations('sections.booking.calendly')
  const [isLoaded, setIsLoaded] = useState(false)

  if (isLoaded) {
    return (
      <iframe
        src={embedUrlOf(url)}
        title={t('title')}
        referrerPolicy="strict-origin-when-cross-origin"
        className={CALENDLY_STYLES.frame}
      />
    )
  }

  // Nothing leaves the site before the click
  return (
    <div className={cn(CALENDLY_STYLES.facade, className)}>
      <p className={CALENDLY_STYLES.notice}>{t('notice')}</p>
      <div className={CALENDLY_STYLES.actions}>
        <Button icon="calendar" onClick={() => setIsLoaded(true)}>
          {t('load')}
        </Button>
        <ActionLink href={url} variant="outline" icon="external" iconPosition="right">
          {t('open')}
        </ActionLink>
      </div>
    </div>
  )
}
