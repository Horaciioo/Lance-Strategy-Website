'use client'

import { useEffect, useState } from 'react'
import type { RefObject } from 'react'

import { ProfileCard } from '@/components/structures/data/ProfileCard'
import { GLOBE_TIMINGS } from '@/declarations/globe'
import { INTRO_STYLES } from '@/declarations/ui/variants'
import { ConfigurationService } from '@/services/ConfigurationService'
import { ViewportService } from '@/services/ViewportService'
import type { GlobeCoordinate, GlobeHandle } from '@/types/globe'
import { cn } from '@/utils/classnames'

const { introDwellMs, introLeaveMs, cardPopMs, cardStaggerMs } = ConfigurationService.timings

// Shown, leaving, turning
const PHASE_MS = [introDwellMs, introLeaveMs, GLOBE_TIMINGS.turnMs]
const PHASES = PHASE_MS.length
const TURNING = PHASES - 1

/**
 * Person shown on the summit
 * @typedef IntroPerson
 */

export interface IntroPerson {
  id: string
  // Camera putting the city on top
  view: GlobeCoordinate
  name: string
  role: string
  place: string
  flag: string
  portrait: string
  portraitAlt: string
  symbol: string
  tags: string[]
}

export interface IntroPeopleProps {
  people: IntroPerson[]
  globeRef: RefObject<GlobeHandle | null>
}

/**
 * Summit card cycle
 * @param {IntroPeopleProps} props - People props
 * @return {JSX.Element} - Rendered pin
 */

export const IntroPeople = ({ people, globeRef }: IntroPeopleProps) => {
  const isStill = ViewportService.usePrefers('reducedMotion')
  const [step, setStep] = useState(0)
  const phase = step % PHASES
  const cycle = Math.floor(step / PHASES)
  const isMoving = phase !== 0
  const active = cycle % Math.max(1, people.length)

  // Card cycle, turning between people
  useEffect(() => {
    if (isStill || people.length < 2) return undefined
    const next = people[(active + 1) % people.length]
    if (phase === TURNING && next) globeRef.current?.focus(next.view)
    const timer = setTimeout(() => setStep((current) => current + 1), PHASE_MS[phase])

    return () => clearTimeout(timer)
  }, [step, phase, active, people, isStill, globeRef])

  return (
    <div className={INTRO_STYLES.pin}>
      <span className={cn(INTRO_STYLES.ping, isMoving && INTRO_STYLES.hidden)} />
      <span className={cn(INTRO_STYLES.dot, isMoving && INTRO_STYLES.stemHidden)} />
      <div className={INTRO_STYLES.column}>
        <div className={INTRO_STYLES.stack}>
          {people.map((person, index) => {
            const isActive = index === active && phase !== TURNING
            const motion = phase === 0 ? INTRO_STYLES.enter : INTRO_STYLES.leave

            return (
              <div
                key={person.id}
                aria-hidden={!isActive || undefined}
                className={cn(INTRO_STYLES.person, !isActive && INTRO_STYLES.hidden)}>
                <ProfileCard
                  name={person.name}
                  role={person.role}
                  place={person.place}
                  flag={person.flag}
                  portrait={person.portrait}
                  portraitAlt={person.portraitAlt}
                  symbol={person.symbol}
                  className={cn(INTRO_STYLES.card, isActive && motion)}
                />
                <ul key={cycle} className={cn(INTRO_STYLES.tags, isActive && phase > 0 && motion)}>
                  {person.tags.map((tag, position) => (
                    <li
                      key={tag}
                      style={{ animationDelay: `${cardPopMs + position * cardStaggerMs}ms` }}
                      className={INTRO_STYLES.tag}>
                      {tag}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
        <span className={cn(INTRO_STYLES.stem, isMoving && INTRO_STYLES.stemHidden)} />
      </div>
    </div>
  )
}
