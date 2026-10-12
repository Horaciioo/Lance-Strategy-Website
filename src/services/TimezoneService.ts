import { AppointmentService } from '@/services/AppointmentService'
import { ConfigurationService } from '@/services/ConfigurationService'
import { Service } from '@/structures/Service'
import type { OpeningHours, ZonedOpening } from '@/types/booking'

const { timeZone } = ConfigurationService.localization
const openingHours = ConfigurationService.identity.openingHours as OpeningHours[]

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MINUTES_IN_HOUR = 60
const DAYS_IN_WEEK = 7
const TIME_PAD = 2

interface ZonedParts {
  day: number
  minutes: number
}

const partsOf = (instant: Date, zone: string): ZonedParts => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: zone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(instant)
  const read = (type: string): string => parts.find((part) => part.type === type)?.value ?? ''

  return {
    day: WEEKDAYS.indexOf(read('weekday')),
    minutes: Number(read('hour')) * MINUTES_IN_HOUR + Number(read('minute')),
  }
}

const timeOf = (minutes: number): string =>
  [Math.floor(minutes / MINUTES_IN_HOUR), minutes % MINUTES_IN_HOUR]
    .map((part) => String(part).padStart(TIME_PAD, '0'))
    .join(':')

// Next date of that weekday, today included
const nextDateOf = (day: number): string => {
  const today = AppointmentService.today()
  const gap = (day - AppointmentService.weekdayOf(today) + DAYS_IN_WEEK) % DAYS_IN_WEEK
  const date = new Date(`${today}T12:00:00Z`)
  date.setUTCDate(date.getUTCDate() + gap)

  return date.toISOString().slice(0, 10)
}

class TimezoneServiceClass extends Service {
  /**
   * Time zone of the visitor
   * @return {string} - IANA name, the business zone when unknown
   */

  visitorZone = (): string => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || timeZone
    } catch {
      return timeZone
    }
  }

  /**
   * Opening windows seen from a zone
   * @param {string} zone - IANA name
   * @return {ZonedOpening[]} - Windows, in business weekday order
   */

  openingsIn = (zone: string): ZonedOpening[] =>
    openingHours.map((entry) => {
      const date = nextDateOf(entry.day)
      const opens = partsOf(AppointmentService.instantOf(date, entry.opensAt), zone)
      const closes = partsOf(AppointmentService.instantOf(date, entry.closesAt), zone)

      return {
        day: opens.day,
        opensAt: timeOf(opens.minutes),
        closesAt: timeOf(closes.minutes),
        closesDayShift: (closes.day - opens.day + DAYS_IN_WEEK) % DAYS_IN_WEEK,
      }
    })

  /**
   * Clock of a zone
   * @param {string} zone - IANA name
   * @param {Date} now - Reference instant
   * @return {string} - Time, HH:MM
   */

  clockOf = (zone: string, now: Date): string => timeOf(partsOf(now, zone).minutes)

  /**
   * Offset of a zone
   * @param {string} zone - IANA name
   * @param {Date} now - Reference instant
   * @return {string} - Offset such as UTC+1
   */

  offsetOf = (zone: string, now: Date): string =>
    (
      new Intl.DateTimeFormat('en-US', { timeZone: zone, timeZoneName: 'shortOffset' })
        .formatToParts(now)
        .find((part) => part.type === 'timeZoneName')?.value ?? ''
    ).replace('GMT', 'UTC')

  /**
   * Open right now in the business zone
   * @param {Date} now - Reference instant
   * @return {boolean} - Inside an opening window
   */

  isOpenAt = (now: Date): boolean => {
    const { day, minutes } = partsOf(now, timeZone)
    const hours = openingHours.find((entry) => entry.day === day)
    if (!hours) return false

    const [opensHours = 0, opensMinutes = 0] = hours.opensAt.split(':').map(Number)
    const [closesHours = 0, closesMinutes = 0] = hours.closesAt.split(':').map(Number)

    return (
      minutes >= opensHours * MINUTES_IN_HOUR + opensMinutes &&
      minutes < closesHours * MINUTES_IN_HOUR + closesMinutes
    )
  }
}

// Zone conversions
export const TimezoneService = new TimezoneServiceClass('timezone')
