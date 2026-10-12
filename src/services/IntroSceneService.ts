import type { RefObject } from 'react'

import { INTRO_BEATS } from '@/declarations/globe'
import { FlightService } from '@/services/flight/FlightService'
import { SketchService } from '@/services/flight/SketchService'
import type { SketchParts } from '@/services/flight/SketchService'
import { ScrollService } from '@/services/ScrollService'
import { Service } from '@/structures/Service'
import type { FlightHandle, FlightKeyframe, FlightSize } from '@/types/flight'
import type { GlobeHandle } from '@/types/globe'
import type { StarfieldHandle } from '@/types/sky'
import { flightKeysOf } from '@/utils/flightPath'
import { beatOf, horizonFramingOf, takeOffOf } from '@/utils/horizon'
import { clampUnit, easeOutCubic as easeOut } from '@/utils/motion'

const { flightStart, flightEnd, follow, sheetStart } = INTRO_BEATS
const { boxFillDelay, boxFillSpan } = INTRO_BEATS

// Preload the plane one screen ahead
const PRELOAD_MARGIN = '100% 0px'
// Fill share caught up per frame
const FILL_EASE = 0.12
// Smoothing settles under this gap
const SETTLED = 0.0004

/**
 * Landing scene parts
 * @typedef IntroSceneMount
 */

export interface IntroSceneMount {
  track: HTMLElement
  stage: HTMLElement
  // Free assessment box, traced by the banner
  box: HTMLElement
  globe: RefObject<GlobeHandle | null>
  starfield: RefObject<StarfieldHandle | null>
  // 3D plane, or the flat fallback
  canvas: HTMLCanvasElement | null
  sketch: SketchParts | null
  bannerText: string
  // WebGL missing, switch to the flat plane
  onFallback: () => void
}

class IntroSceneServiceClass extends Service {
  /**
   * Landing frame without motion
   * @param {HTMLElement} stage - Pinned stage
   * @param {RefObject<GlobeHandle | null>} globe - Planet controls
   * @return {void}
   */

  still = (stage: HTMLElement, globe: RefObject<GlobeHandle | null>): void => {
    const { clientWidth: width, clientHeight: height } = stage
    const framing = horizonFramingOf({ width, height, progress: 0 })
    stage.style.setProperty('--anchor-y', `${framing.anchorY}px`)
    globe.current?.frame(framing)
  }

  /**
   * Scroll choreography of the landing scene
   * @param {IntroSceneMount} parts - Scene parts
   * @return {() => void} - Teardown
   */

  mount = (parts: IntroSceneMount): (() => void) => {
    const { track, stage, box } = parts
    let handle: FlightHandle | null = null
    let isStopped = false
    let target = 0
    let current = 0
    let frameId = 0
    let keys: FlightKeyframe[] = []
    let size: FlightSize = { width: 1, height: 1, originX: 0, originY: 0 }

    // Flight share where the banner closed the top edge
    let closedAt: number | null = null
    // Shown fill, eased towards the target
    let shownFill = 0

    // Top edge follows the banner tail, the rest once it is closed
    const trace = (edge: number, flight: number) => {
      const bounds = box.getBoundingClientRect()
      const tail = clampUnit(edge) * size.width
      const top = flight > 0.5 ? clampUnit((tail - bounds.left) / Math.max(bounds.width, 1)) : 0
      // Sticky once closed, the flutter cannot reopen it
      if (closedAt !== null && flight < closedAt) closedAt = null
      if (top >= 1) closedAt ??= flight
      // Done once the flight is over
      const since = closedAt === null ? -1 : flight >= 1 ? 1 : flight - closedAt
      const fill = clampUnit((since - boxFillDelay) / boxFillSpan)
      shownFill += (easeOut(fill) - shownFill) * FILL_EASE
      if (Math.abs(easeOut(fill) - shownFill) < SETTLED) shownFill = easeOut(fill)
      box.style.setProperty('--fill', shownFill.toFixed(4))
      box.dataset.ready = String(shownFill > 0.5)
    }

    const sketch = (flight: number) => {
      if (!parts.sketch) return
      trace(SketchService.place({ keys, progress: flight, size, parts: parts.sketch }), flight)
    }

    // One frame of the whole scene
    const apply = (progress: number) => {
      const flight = clampUnit((progress - flightStart) / (flightEnd - flightStart))
      const framing = horizonFramingOf({ width: size.width, height: size.height, progress })
      stage.style.setProperty('--intro', String(progress))
      stage.style.setProperty('--anchor-y', `${framing.anchorY}px`)
      stage.style.setProperty('--sheet', String(beatOf(progress, sheetStart, 1)))
      parts.globe.current?.frame(framing)
      parts.starfield.current?.frame(progress)
      handle?.frame(flight)
      // Plane waits on the ground
      if (parts.canvas) parts.canvas.style.opacity = flight > 0 ? '1' : '0'
      sketch(flight)
    }

    // Eases towards the scroll position
    const settle = () => {
      current += (target - current) * follow
      if (Math.abs(target - current) < SETTLED) current = target
      apply(current)
      frameId = current === target ? 0 : requestAnimationFrame(settle)
    }

    // Stage size and take-off point
    const measure = () => {
      const { clientWidth: width, clientHeight: height } = stage
      const origin = takeOffOf({ width, height })
      size = { width, height, originX: origin.x, originY: origin.y }
      keys = flightKeysOf({ x: (origin.x / width) * 2 - 1, y: 1 - (origin.y / height) * 2 })
      handle?.resize(size)
      apply(current)
    }

    const stopTracking = ScrollService.track(track, (share) => {
      target = share
      if (frameId === 0) frameId = requestAnimationFrame(settle)
    })
    const resizing = new ResizeObserver(measure)
    resizing.observe(stage)
    measure()

    // 3D plane loads when near
    const watching = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return
        if (entry.isIntersecting && !handle && !isStopped && parts.canvas) {
          FlightService.mount({
            canvas: parts.canvas,
            bannerText: parts.bannerText,
            onWake: (edge) =>
              trace(edge, clampUnit((current - flightStart) / (flightEnd - flightStart))),
          }).then((mounted) => {
            if (isStopped) return mounted?.dispose()
            if (!mounted) return parts.onFallback()
            handle = mounted
            measure()
          })
        }
        handle?.setActive(entry.isIntersecting)
      },
      { rootMargin: PRELOAD_MARGIN }
    )
    watching.observe(track)

    return () => {
      isStopped = true
      cancelAnimationFrame(frameId)
      stopTracking()
      resizing.disconnect()
      watching.disconnect()
      handle?.dispose()
    }
  }
}

// Landing scene timeline
export const IntroSceneService = new IntroSceneServiceClass('introScene')
