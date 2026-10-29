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

// Timeline share where the box is filled, the playback stops there
const PLAY_END = flightStart + (flightEnd - flightStart) * (boxFillStart + boxFillSpan)
// Preload the plane one screen ahead
const PRELOAD_MARGIN = '100% 0px'
// Fill share caught up per frame
const FILL_EASE = 0.12
// Smoothing settles under this gap
const SETTLED = 0.0004
// Longest step per frame, a stalled frame slows the scene instead of skipping it
const MAX_FRAME_MS = 50
// Finger travel read as a swipe, pixels
const SWIPE_PX = 10
// Keys that scroll the page, down then up
const DOWN_KEYS = new Set(['ArrowDown', 'PageDown', 'End', ' ', 'Spacebar'])
const UP_KEYS = new Set(['ArrowUp', 'PageUp', 'Home'])
// Fields keep their own keys
const FIELDS = 'input, textarea, select, [contenteditable]'

// Forward to the box, back to the landing
type Way = 1 | -1

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

// Kept across remounts: a remount resumes, a return to the landing shows where the visitor left it
let playedShare = 0
// The landing hold runs once per visit
let hasStarted = false

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
   * Landing choreography: a scroll gesture plays it up to the filled box, an upward one at the
   * top plays it back to the landing, the scroll then slides the page over the planet
   * @param {IntroSceneMount} parts - Scene parts
   * @return {() => void} - Teardown
   */

  mount = (parts: IntroSceneMount): (() => void) => {
    const { track, stage, box } = parts
    let handle: FlightHandle | null = null
    let isStopped = false
    // Played share of the timeline, then the scroll share of the runway
    let played = playedShare
    let scrolled = 0
    let current = played
    // Playing towards the box, back to the landing, or resting
    let way: Way | 0 = 0
    let held = 0
    let lastFrame: number | null = null
    let touchY: number | null = null
    let frameId = 0
    let playId = 0
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

    // The page only scrolls once the box is filled
    const lock = () => {
      unlock ??= ScrollService.lock()
    }
    const release = () => {
      unlock?.()
      unlock = null
    }

    // Resting on the landing or on the box
    const rest = () => {
      cancelAnimationFrame(playId)
      playId = 0
      way = 0
      lastFrame = null
      if (played >= PLAY_END) release()
      else lock()
      schedule()
    }

    // Frame driven clock: the landing hold, then the playback either way
    const tick = (now: number) => {
      const step = Math.min(now - (lastFrame ?? now), MAX_FRAME_MS)
      lastFrame = now
      if (way === 0) {
        held += step
        if (held >= holdMs) way = 1
      } else {
        played = Math.min(Math.max(played + (way * PLAY_END * step) / durationMs, 0), PLAY_END)
        playedShare = played
        current = played
        apply(current)
        if ((way === 1 && played >= PLAY_END) || (way === -1 && played <= 0)) return rest()
      }
      playId = requestAnimationFrame(tick)
    }

    const play = (next: Way) => {
      hasStarted = true
      way = next
      lock()
      cancelAnimationFrame(frameId)
      frameId = 0
      if (playId === 0) playId = requestAnimationFrame(tick)
    }

    // Down plays towards the box, up at the top plays back to the landing
    const ask = (next: Way) => {
      if (window.scrollY > 0) return
      if (next === 1 && played < PLAY_END) play(1)
      if (next === -1 && played > 0) play(-1)
    }

    const onWheel = (event: WheelEvent) => {
      if (event.deltaY !== 0) ask(event.deltaY > 0 ? 1 : -1)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof Element && event.target.closest(FIELDS)) return
      if (DOWN_KEYS.has(event.key)) ask(1)
      else if (UP_KEYS.has(event.key)) ask(-1)
    }
    const onTouchStart = (event: TouchEvent) => {
      touchY = event.touches[0]?.clientY ?? null
    }
    // Finger up reads as down the page
    const onTouchMove = (event: TouchEvent) => {
      const y = event.touches[0]?.clientY
      if (touchY === null || y === undefined || Math.abs(y - touchY) < SWIPE_PX) return
      ask(y < touchY ? 1 : -1)
      touchY = y
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
      // Arrived further down the page, the scene is over
      if (scrolled > 0 && played < PLAY_END) {
        played = PLAY_END
        playedShare = PLAY_END
        hasStarted = true
        rest()
      }
      schedule()
    })
    const resizing = new ResizeObserver(measure)
    resizing.observe(stage)
    measure()

    window.addEventListener('wheel', onWheel, { passive: true })
    window.addEventListener('keydown', onKey)
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })

    // Resumes a flight cut short, holds the landing on the first visit
    if (played > 0 && played < PLAY_END) play(1)
    else if (played < PLAY_END) {
      lock()
      if (!hasStarted) playId = requestAnimationFrame(tick)
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
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      release()
      stopTracking()
      resizing.disconnect()
      watching.disconnect()
      handle?.dispose()
    }
  }
}

// Landing scene timeline
export const IntroSceneService = new IntroSceneServiceClass('introScene')
