'use client'

import { useRef } from 'react'
import type { PointerEvent } from 'react'

import { PLANE_BODY, PLANE_TAIL_STRIPE } from '@/components/elements/media/PlaneGlyph'
import { FLIGHT_COLORS } from '@/declarations/flight'
import { SCROLL_PLANE_STYLES } from '@/declarations/ui/variants'
import { ScrollService } from '@/services/ScrollService'

// Glyph size in px
const PLANE_SIZE = 20

/**
 * Page share scrolled
 * @param {number} offset - Scroll offset
 * @return {number} - 0 to 1
 */

const shareOf = (offset: number): number => {
  if (typeof document === 'undefined') return 0
  const range = document.documentElement.scrollHeight - window.innerHeight

  return range > 0 ? Math.min(Math.max(offset / range, 0), 1) : 0
}

/**
 * Plane scrollbar, nose towards the scroll direction
 * @return {JSX.Element} - Rendered scrollbar
 */

export const ScrollPlane = () => {
  const { offset, direction } = ScrollService.use()
  const railRef = useRef<HTMLDivElement>(null)
  const share = shareOf(offset)

  // Drag scrolls the page
  const drag = (event: PointerEvent<HTMLDivElement>) => {
    const rail = railRef.current
    if (!rail || !event.currentTarget.hasPointerCapture(event.pointerId)) return
    const bounds = rail.getBoundingClientRect()
    const ratio = (event.clientY - bounds.top) / Math.max(bounds.height, 1)
    const range = document.documentElement.scrollHeight - window.innerHeight
    window.scrollTo({ top: Math.min(Math.max(ratio, 0), 1) * range })
  }

  return (
    <div ref={railRef} aria-hidden="true" className={SCROLL_PLANE_STYLES.rail}>
      <span className={SCROLL_PLANE_STYLES.track} />
      <span
        className={SCROLL_PLANE_STYLES.progress}
        style={{ height: `calc(${share * 100}% - ${share * PLANE_SIZE}px)` }}
      />
      <div
        className={SCROLL_PLANE_STYLES.plane}
        style={{
          top: `calc(${share * 100}% - ${share * PLANE_SIZE}px)`,
          rotate: direction === 'down' ? '180deg' : '0deg',
        }}
        onPointerDown={(event) => event.currentTarget.setPointerCapture(event.pointerId)}
        onPointerMove={drag}>
        <svg viewBox="0 0 100 100" className="h-full w-full">
          <path
            d={PLANE_BODY}
            fill={FLIGHT_COLORS.body}
            stroke={FLIGHT_COLORS.ink}
            strokeWidth="3"
          />
          <path d={PLANE_TAIL_STRIPE} fill={FLIGHT_COLORS.accent} />
        </svg>
      </div>
    </div>
  )
}
