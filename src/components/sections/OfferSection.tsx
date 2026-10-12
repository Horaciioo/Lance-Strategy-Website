import { useTranslations } from 'next-intl'

import { Picture } from '@/components/elements/media/Picture'
import { OFFERS } from '@/declarations/content'
import { SECTION_ANCHORS } from '@/declarations/routes'
import { MOTION, SECTION_SPACING } from '@/declarations/ui/tokens'
import { OFFER_STYLES } from '@/declarations/ui/variants'
import type { MediaItem } from '@/types/content'
import { cn } from '@/utils/classnames'

// Card width hint
const CARD_SIZES = '15rem'

export interface OfferSectionProps {
  // Even count keeps the stagger seamless
  items?: MediaItem[]
}

/**
 * Offers carousel section
 * @param {OfferSectionProps} props - Offer section props
 * @return {JSX.Element} - Rendered section
 */

export const OfferSection = ({ items = OFFERS }: OfferSectionProps) => {
  const t = useTranslations('sections.offers')

  // Second copy loops the band
  const cards = [...items, ...items].map((item, index) => {
    const isCopy = index >= items.length
    const key = `items.${item.translationKey}`

    return (
      <figure
        key={`${item.id}-${index}`}
        aria-hidden={isCopy || undefined}
        className={cn(OFFER_STYLES.card, index % 2 === 1 && OFFER_STYLES.cardLow)}>
        <Picture
          src={item.src}
          alt={isCopy ? '' : t(`${key}.alt`)}
          ratio="portrait"
          sizes={CARD_SIZES}
          className={OFFER_STYLES.picture}
        />
        <figcaption className={OFFER_STYLES.label}>{t(`${key}.title`)}</figcaption>
      </figure>
    )
  })

  return (
    <section id={SECTION_ANCHORS.offers} className={SECTION_SPACING.lg}>
      <h2 className={OFFER_STYLES.title}>{t.rich('title', { accent: (chunks) => chunks })}</h2>

      <div className={cn(MOTION.marqueeBleed, OFFER_STYLES.viewport)}>
        <div className={cn(MOTION.marquee, OFFER_STYLES.track)}>{cards}</div>
      </div>
    </section>
  )
}
