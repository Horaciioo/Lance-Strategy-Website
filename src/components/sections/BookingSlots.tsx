import type { CSSProperties } from 'react'
import { useLocale, useTranslations } from 'next-intl'

import { Icon } from '@/components/elements/media/Icon'
import { SLOT_BOARD_VARIABLES } from '@/declarations/ui/shapes'
import { BOOKING_STYLES } from '@/declarations/ui/variants'
import { ConfigurationService } from '@/services/ConfigurationService'
import { FormatService } from '@/services/FormatService'
import { cn } from '@/utils/classnames'

const { slotStaggerMs } = ConfigurationService.timings

// Placeholder cells on an empty board
const GHOST_CELLS = 8

export interface BookingSlotsProps {
  zone: string
  date: string | null
  slots: string[]
  isLoading: boolean
  selected: string | null
  // Slot clock in the visitor zone
  clockOf: (slot: string) => string
  onSelect: (slot: string) => void
}

/**
 * Cell stagger
 * @param {number} index - Cell position
 * @return {CSSProperties} - Delay style
 */

const staggerOf = (index: number): CSSProperties => ({
  animationDelay: `${index * slotStaggerMs}ms`,
})

/**
 * Slot board, zone tab and free slots
 * @param {BookingSlotsProps} props - Board props
 * @return {JSX.Element} - Rendered board
 */

export const BookingSlots = ({
  zone,
  date,
  slots,
  isLoading,
  selected,
  clockOf,
  onSelect,
}: BookingSlotsProps) => {
  const t = useTranslations('sections.booking')
  const format = FormatService.for(useLocale())
  // Old slots stay while the next day loads
  const isWaiting = !date || (isLoading && slots.length === 0)

  return (
    <div className={BOOKING_STYLES.board} style={SLOT_BOARD_VARIABLES as CSSProperties}>
      <div className={BOOKING_STYLES.tab}>
        <Icon name="clock" size="sm" className={BOOKING_STYLES.tabIcon} />
        <div className="flex flex-col">
          <span className={BOOKING_STYLES.tabLabel}>{t('zoneLabel')}</span>
          <span className={BOOKING_STYLES.tabZone}>{zone.replaceAll('_', ' ')}</span>
        </div>
      </div>

      <div className={BOOKING_STYLES.content} aria-live="polite" aria-busy={isLoading}>
        {date ? (
          <p className={BOOKING_STYLES.summary}>{format.date(date, 'weekday')}</p>
        ) : (
          <p className={BOOKING_STYLES.hint}>{t('pickDate')}</p>
        )}

        {isWaiting && (
          <div className={BOOKING_STYLES.slots} aria-hidden="true">
            {Array.from({ length: GHOST_CELLS }, (_, index) => (
              <span
                key={index}
                className={cn(BOOKING_STYLES.ghost, isLoading && 'surface-shimmer')}
              />
            ))}
          </div>
        )}

        {!isWaiting && slots.length === 0 && <p className={BOOKING_STYLES.hint}>{t('noSlot')}</p>}

        {!isWaiting && slots.length > 0 && (
          <div className={cn(BOOKING_STYLES.slots, isLoading && BOOKING_STYLES.slotsLoading)}>
            {slots.map((slot, index) => (
              <button
                key={slot}
                type="button"
                aria-pressed={slot === selected}
                style={staggerOf(index)}
                className={cn(
                  BOOKING_STYLES.slot,
                  slot === selected && BOOKING_STYLES.slotSelected
                )}
                onClick={() => onSelect(slot)}>
                {slot === selected && (
                  <Icon name="check" size="sm" className={BOOKING_STYLES.slotCheck} />
                )}
                {clockOf(slot)}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
