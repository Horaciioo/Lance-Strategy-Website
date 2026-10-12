'use client'

import { useEffect, useMemo, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'

import { SCHEDULE_STYLES } from '@/declarations/ui/variants'
import { ConfigurationService } from '@/services/ConfigurationService'
import { FormatService } from '@/services/FormatService'
import { NamingService } from '@/services/NamingService'
import { TimezoneService } from '@/services/TimezoneService'
import type { Styleable } from '@/types/common'
import { cn } from '@/utils/classnames'

// Clock refresh
const TICK_MS = 30_000
const DAYS_IN_WEEK = 7

const { timeZone, firstDayOfWeek } = ConfigurationService.localization

/**
 * Opening hours in any time zone
 * @param {Styleable} props - Card props
 * @return {JSX.Element} - Rendered card
 */

export const ScheduleCard = ({ className }: Styleable) => {
  const t = useTranslations('sections.schedule')
  const weekdays = FormatService.for(useLocale()).weekdays('long')

  const [now, setNow] = useState<Date | null>(null)
  const zone = timeZone

  // Live clock
  useEffect(() => {
    setNow(new Date())
    const timer = window.setInterval(() => setNow(new Date()), TICK_MS)

    return () => window.clearInterval(timer)
  }, [])

  const rows = useMemo(
    () =>
      TimezoneService.openingsIn(zone).sort(
        (first, second) =>
          ((first.day - firstDayOfWeek + DAYS_IN_WEEK) % DAYS_IN_WEEK) -
          ((second.day - firstDayOfWeek + DAYS_IN_WEEK) % DAYS_IN_WEEK)
      ),
    [zone]
  )

  return (
    <div className={cn(SCHEDULE_STYLES.card, className)}>
      <div className={SCHEDULE_STYLES.head}>
        <h3 className={SCHEDULE_STYLES.title}>{t('title')}</h3>
        <span className={SCHEDULE_STYLES.zone}>{t('zone')}</span>
      </div>

      {now && (
        <p className={SCHEDULE_STYLES.status} aria-live="polite">
          <span>
            {t('now', {
              time: TimezoneService.clockOf(zone, now),
              offset: TimezoneService.offsetOf(zone, now),
            })}
          </span>
          <span className="font-medium text-foreground">
            {TimezoneService.isOpenAt(now) ? t('open') : t('closed')}
          </span>
        </p>
      )}

      <ul className={SCHEDULE_STYLES.rows}>
        {rows.map((row) => (
          <li
            key={NamingService.toDomId('schedule', String(row.day))}
            className={SCHEDULE_STYLES.row}>
            <span className={SCHEDULE_STYLES.day}>
              {weekdays[(row.day - firstDayOfWeek + DAYS_IN_WEEK) % DAYS_IN_WEEK]}
            </span>
            <span className={SCHEDULE_STYLES.hours}>
              {t('range', {
                opensAt: row.opensAt,
                closesAt:
                  row.closesDayShift > 0 ? t('nextDay', { closesAt: row.closesAt }) : row.closesAt,
              })}
            </span>
          </li>
        ))}
      </ul>
      <p className={SCHEDULE_STYLES.note}>{t('description')}</p>
    </div>
  )
}
