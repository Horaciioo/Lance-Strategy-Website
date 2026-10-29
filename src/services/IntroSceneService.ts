import type { RefObject } from 'react'

import { INTRO_BEATS, INTRO_PLAY } from '@/declarations/globe'
import { createStore } from '@/services/core/StoreService'
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
const { boxFillStart, boxFillSpan } = INTRO_BEATS
const { holdMs, durationMs } = INTRO_PLAY

// Timeline share where the box is filled, the autoplay stops there
const PLAY_END = flightStart + (flightEnd - flightStart) * (boxFillStart + boxFillSpan)
// Preload the plane one screen ahead
const PRELOAD_MARGIN = '100% 0px'
// Fill share caught up per frame
const FILL_EASE = 0.12
// Smoothing settles under this gap
const SETTLED = 0.0004
// Longest step per frame, a stalled frame slows the scene instead of skipping it
const MAX_FRAME_MS = 50
// Keys that scroll the page
const SCROLL_KEYS = new Set(['ArrowDown', 'PageDown', 'End', ' ', 'Spacebar'])
// Gestures asking to move on, they cut the landing hold short
const INTENT_EVENTS = ['wheel', 'touchmove', 'keydown'] as const

/**
 * Landing scene parts
 * @typedef IntroSceneMount
 */

export interface IntroSceneMount {
  track: HTMLElement
  stage: HTMLElement
  // Free assessment box, filled once the plane is gone
  box: HTMLElement
  globe: RefObject<GlobeHandle | null>
  starfield: RefObject<StarfieldHandle | null>
  // 3D plane, or the flat fallback
  canvas: HTMLCanvasElement | null
  sketch: SketchParts | null
  // WebGL missing, switch to the flat plane
  onFallback: () => void
}

// Scene timeline, read by the navbar logo
const store = createStore(0)

// Played once per visit: a remount resumes, a return to the landing shows the box
let playedShare = 0

class IntroSceneServiceClass extends Service {
  store = store

  /**
   * Follow the scene timeline
   * @return {number} - 0 to 1
   */

  use = (): number => store.use()

  /**
   * Landing frame without motion
   * @param {HTMLElement} stage - Pinned stage
   * @param {RefObject<GlobeHandle | null>} globe - Planet controls
   * @return {void}
   */

  still = (stage: HTMLElement, globe: RefObject<GlobeHandle | null>): void => {
    const { clientWidth: width, clientHeight: height } = stage
    const framing = horizonFramingOf({ width, height, progress: 0 })
    globe.current?.frame(framing)
    // Nothing plays, the navbar logo stays home
    store.setState(1)
  }

  /**
   * Landing choreography: plays by itself up to the filled box, the scroll then slides the page over
   * @param {IntroSceneMount} parts - Scene parts
   * @return {() => void} - Teardown
   */

  mount = (parts: IntroSceneMount): (() => void) => {
    const { track, stage, box } = parts
    let handle: FlightHandle | null = null
    let isStopped = false
    // Autoplay share reached, then the scroll share of the runway
    let played = playedShare
    let scrolled = 0
    let current = played
    let frameId = 0
    let playId = 0
    // Clock of the autoplay, the landing hold included
    let elapsed = played > 0 ? holdMs + (played / PLAY_END) * durationMs : 0
    let lastFrame: number | null = null
    let unlock: (() => void) | null = null
    let keys: FlightKeyframe[] = []
    let size: FlightSize = { width: 1, height: 1, originX: 0, originY: 0 }

    // Shown fill, eased towards the target
    let shownFill = 0

    // Box fills once the plane is gone, true once caught up
    const reveal = (flight: number): boolean => {
      const fill = easeOut(clampUnit((flight - boxFillStart) / boxFillSpan))
      shownFill += (fill - shownFill) * FILL_EASE
      if (Math.abs(fill - shownFill) < SETTLED) shownFill = fill
      box.style.setProperty('--fill', shownFill.toFixed(4))
      box.dataset.ready = String(shownFill > 0.5)

      return shownFill === fill
    }

    // One frame of the whole scene, true once the box has caught up
    const apply = (progress: number): boolean => {
      const flight = clampUnit((progress - flightStart) / (flightEnd - flightStart))
      const framing = horizonFramingOf({ width: size.width, height: size.height, progress })
      store.setState(progress)
      stage.style.setProperty('--intro', String(progress))
      stage.style.setProperty('--sheet', String(beatOf(progress, sheetStart, 1)))
      parts.globe.current?.frame(framing)
      parts.starfield.current?.frame(progress)
      handle?.frame(flight)
      // Plane waits on the ground
      if (parts.canvas) parts.canvas.style.opacity = flight > 0 ? '1' : '0'
      if (parts.sketch) SketchService.place({ keys, progress: flight, size, parts: parts.sketch })

      return reveal(flight)
    }

    // Played share, then the scroll carries the rest of the timeline
    const targetOf = () => (scrolled > 0 ? PLAY_END + scrolled * (1 - PLAY_END) : played)

    // Eases towards the target, the box keeps filling until it settles
    const settle = () => {
      const target = targetOf()
      current += (target - current) * follow
      if (Math.abs(target - current) < SETTLED) current = target
      const isFilled = apply(current)
      frameId = current === target && isFilled ? 0 : requestAnimationFrame(settle)
    }
    const schedule = () => {
      if (frameId === 0 && playId === 0) frameId = requestAnimationFrame(settle)
    }

    // A scroll attempt cuts the hold short instead of moving the page
    const onIntent = (event: Event) => {
      if (event instanceof KeyboardEvent && !SCROLL_KEYS.has(event.key)) return
      elapsed = Math.max(elapsed, holdMs)
    }

    // Autoplay over, the page scrolls again
    const finish = () => {
      cancelAnimationFrame(playId)
      playId = 0
      played = PLAY_END
      playedShare = PLAY_END
      unlock?.()
      unlock = null
      INTENT_EVENTS.forEach((name) => window.removeEventListener(name, onIntent))
      schedule()
    }

    // Frame driven timeline: landing hold, then the flight up to the filled box
    const play = (now: number) => {
      elapsed += Math.min(now - (lastFrame ?? now), MAX_FRAME_MS)
      lastFrame = now
      played = PLAY_END * clampUnit((elapsed - holdMs) / durationMs)
      playedShare = played
      if (played !== current) {
        current = played
        apply(current)
      }
      if (played < PLAY_END) playId = requestAnimationFrame(play)
      else finish()
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
      // The stage tucks under the navbar, its share is not quite 0 at the top of the page
      scrolled = window.scrollY > 0 ? share : 0
      // Arrived further down the page, nothing left to play
      if (scrolled > 0 && played < PLAY_END) finish()
      schedule()
    })
    const resizing = new ResizeObserver(measure)
    resizing.observe(stage)
    measure()

    if (played < PLAY_END) {
      unlock = ScrollService.lock()
      INTENT_EVENTS.forEach((name) => window.addEventListener(name, onIntent, { passive: true }))
      playId = requestAnimationFrame(play)
    }

    // 3D plane loads when near
    const watching = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return
        if (entry.isIntersecting && !handle && !isStopped && parts.canvas) {
          FlightService.mount({ canvas: parts.canvas }).then((mounted) => {
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
      cancelAnimationFrame(playId)
      INTENT_EVENTS.forEach((name) => window.removeEventListener(name, onIntent))
      unlock?.()
      stopTracking()
      resizing.disconnect()
      watching.disconnect()
      handle?.dispose()
    }
  }
}

// Landing scene timeline
export const IntroSceneService = new IntroSceneServiceClass('introScene')
