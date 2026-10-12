import { GLOBE_GEOMETRY, GLOBE_INKS, GLOBE_PLANET, GLOBE_TIMINGS } from '@/declarations/globe'
import { GlobeRenderService } from '@/services/GlobeRenderService'
import { NamingService } from '@/services/NamingService'
import { PlanetService } from '@/services/PlanetService'
import { ThemeService } from '@/services/ThemeService'
import { Service } from '@/structures/Service'
import type {
  GlobeCoordinate,
  GlobeFocus,
  GlobeFraming,
  GlobeHandle,
  GlobeLabel,
  GlobePalette,
  GlobePlace,
  GlobeRoute,
  PlanetHandle,
  PreparedPlace,
  PreparedRoute,
  Vector,
} from '@/types/globe'
import { cameraOf, lengthsOf, liftPath, pathThrough, smoothPath, vectorOf } from '@/utils/geo'
import { blendViews, focusedViewOf, turnTowards } from '@/utils/globeView'
import { easeInOutCubic, easeOutCubic, lerp, progressOf } from '@/utils/motion'

const { introView, restView } = GLOBE_GEOMETRY

const { introMs, revealMs, routeDelayMs, routeMs, swayMs, travelMs, returnMs } = GLOBE_TIMINGS

// Fully settled timeline
const SETTLED_MS = Math.max(introMs, revealMs, routeDelayMs + routeMs)
const PRESENCE_MS = 900
const DASH_PERIOD_PX = 7
const SMOOTHING_PASSES = 2

/**
 * Globe mount request
 * @typedef GlobeMountOptions
 */

export interface GlobeMountOptions {
  canvas: HTMLCanvasElement
  places: Record<string, GlobePlace>
  routes: GlobeRoute[]
  labels: Record<string, GlobeLabel>
  // Reduced motion
  isStill: boolean
  hasRing: boolean
  // Opening view override
  initialView?: GlobeCoordinate
  // GPU layer under the overlay
  planetCanvas?: HTMLCanvasElement | null
}

interface GlobeSession {
  options: GlobeMountOptions
  context: CanvasRenderingContext2D
  width: number
  height: number
  pixelRatio: number
  centerX: number
  centerY: number
  radius: number
  framing: GlobeFraming | null
  focus: GlobeFocus | null
  routes: PreparedRoute[]
  places: PreparedPlace[]
  planet: PlanetHandle | null
  origin: Vector
  palette: GlobePalette
  fontFamily: string
  startedAt: number
  drag: GlobeCoordinate
  releasedAt: number | null
  pointer: { x: number; y: number } | null
  isVisible: boolean
  frameId: number
  // Repaint now, not on the idle cadence
  isUrgent: boolean
  paintedAt: number
}

const offsetOf = (session: GlobeSession, now: number): GlobeCoordinate => {
  if (session.pointer || session.releasedAt === null) return session.drag

  // Spring back to rest
  const remaining = 1 - easeOutCubic(progressOf(now - session.releasedAt, 0, returnMs))

  return {
    longitude: session.drag.longitude * remaining,
    latitude: session.drag.latitude * remaining,
  }
}

// Intro then rest, unless steered
const baseViewOf = (session: GlobeSession, elapsed: number, now: number): GlobeCoordinate => {
  if (session.focus) return focusedViewOf(session.focus, now)
  if (session.options.initialView) return session.options.initialView

  const intro = easeInOutCubic(progressOf(elapsed, 0, introMs))
  const sway = session.options.isStill
    ? 0
    : GLOBE_GEOMETRY.swayDegrees * Math.sin((2 * Math.PI * Math.max(0, elapsed - introMs)) / swayMs)

  return {
    longitude: lerp(introView.longitude, restView.longitude, intro) + sway,
    latitude: lerp(introView.latitude, restView.latitude, intro),
  }
}

const viewOf = (session: GlobeSession, elapsed: number, now: number): GlobeCoordinate => {
  const towards = session.framing?.towards
  const steered = baseViewOf(session, elapsed, now)
  const base = towards ? blendViews(steered, towards.view, towards.share) : steered
  const offset = offsetOf(session, now)
  const turn = session.framing?.turnDegrees ?? 0

  return {
    longitude: base.longitude + offset.longitude + turn,
    latitude: base.latitude + offset.latitude,
  }
}

const prepareRoutes = ({ places, routes }: GlobeMountOptions): PreparedRoute[] =>
  routes.flatMap((route) => {
    const from = places[route.from]
    const to = places[route.to]
    if (!from || !to) return []

    // Waypoints into a smooth great circle path
    const via = (route.via ?? []).map(([longitude, latitude]) => ({ longitude, latitude }))
    const stops = [from, ...via, to].map(vectorOf)
    const surface = smoothPath(
      pathThrough(stops, GLOBE_GEOMETRY.routeStepDegrees),
      route.via ? SMOOTHING_PASSES : 0
    )
    const points = route.kind === 'air' ? liftPath(surface, GLOBE_GEOMETRY.airLift) : surface

    return [{ id: route.id, kind: route.kind, points, lengths: lengthsOf(points) }]
  })

const preparePlaces = ({ places, labels }: GlobeMountOptions): PreparedPlace[] =>
  Object.entries(places).map(([id, place]) => ({
    id,
    vector: vectorOf(place),
    label: place.isLabelled ? labels[id] : undefined,
  }))

class GlobeServiceClass extends Service {
  /**
   * Theme inks
   * @param {HTMLCanvasElement} canvas - Scheme carrier
   * @return {GlobePalette} - RGB channels per ink
   */

  readPalette = (canvas: HTMLCanvasElement): GlobePalette => {
    const style = getComputedStyle(canvas)

    return Object.fromEntries(
      Object.entries(GLOBE_INKS).map(([ink, color]) => [
        ink,
        style.getPropertyValue(NamingService.toCssVariable('color', color)).trim(),
      ])
    ) as GlobePalette
  }

  /**
   * Start drawing a globe
   * @param {GlobeMountOptions} options - Canvas and data
   * @return {GlobeHandle} - Live controls
   */

  mount = (options: GlobeMountOptions): GlobeHandle => {
    const context = options.canvas.getContext('2d')
    if (!context) return { focus: () => undefined, frame: () => undefined, stop: () => undefined }

    const places = preparePlaces(options)
    const session: GlobeSession = {
      options,
      context,
      width: 0,
      height: 0,
      pixelRatio: 1,
      centerX: 0,
      centerY: 0,
      radius: 0,
      framing: null,
      focus: null,
      routes: prepareRoutes(options),
      places,
      planet: options.planetCanvas ? PlanetService.mount(options.planetCanvas) : null,
      origin: places[0]?.vector ?? vectorOf(introView),
      palette: this.readPalette(options.canvas),
      fontFamily: getComputedStyle(options.canvas).fontFamily,
      startedAt: performance.now(),
      drag: { longitude: 0, latitude: 0 },
      releasedAt: null,
      pointer: null,
      isVisible: true,
      frameId: 0,
      isUrgent: true,
      paintedAt: 0,
    }

    const teardowns = [this.observe(session), this.listen(session)]
    this.resize(session)

    return {
      focus: (view) => this.focus(session, view),
      frame: (framing) => {
        session.framing = framing
        this.layout(session)
      },
      stop: () => {
        cancelAnimationFrame(session.frameId)
        session.frameId = -1
        session.planet?.dispose()
        teardowns.forEach((teardown) => teardown())
      },
    }
  }

  // Eastward turn from the current view
  private focus = (session: GlobeSession, view: GlobeCoordinate): void => {
    const now = performance.now()
    const from = baseViewOf(session, now - session.startedAt, now)
    session.focus = {
      from,
      to: turnTowards(from, view),
      startedAt: session.options.isStill ? -Infinity : now,
      durationMs: GLOBE_TIMINGS.turnMs,
    }
    this.request(session)
  }

  private resize = (session: GlobeSession): void => {
    const { canvas } = session.options
    const ratio = Math.min(window.devicePixelRatio || 1, GLOBE_GEOMETRY.maxPixelRatio)
    // Layout size, blind to entrance transforms
    const { clientWidth: width, clientHeight: height } = canvas

    canvas.width = Math.round(width * ratio)
    canvas.height = Math.round(height * ratio)
    session.context.setTransform(ratio, 0, 0, ratio, 0, 0)
    session.width = width
    session.height = height
    session.pixelRatio = ratio
    this.layout(session)
  }

  // Centre and radius
  private layout = (session: GlobeSession): void => {
    const { width, height, framing } = session
    session.centerX = framing?.centerX ?? width / 2
    session.centerY = framing?.centerY ?? height / 2
    session.radius = framing?.radius ?? Math.min(width, height) * GLOBE_GEOMETRY.radiusShare

    this.request(session)
  }

  private paint = (session: GlobeSession, now: number): void => {
    const { isStill } = session.options
    const elapsed = isStill ? SETTLED_MS : now - session.startedAt
    const routeProgress = progressOf(elapsed, routeDelayMs, routeMs)
    const settledFor = elapsed - routeDelayMs - routeMs

    const camera = cameraOf(viewOf(session, elapsed, now))
    const presence = easeOutCubic(progressOf(elapsed, 0, PRESENCE_MS))

    session.planet?.draw({
      width: session.width,
      height: session.height,
      pixelRatio: session.pixelRatio,
      centerX: session.centerX,
      centerY: session.centerY,
      radius: session.radius,
      camera,
      cloudDrift: isStill ? 0 : (elapsed / 1000) * GLOBE_PLANET.cloudTurnsPerSecond,
      time: isStill ? 0 : elapsed / 1000,
      presence,
    })

    GlobeRenderService.draw({
      ...session,
      hasRing: session.options.hasRing,
      hasPlanet: session.planet !== null,
      camera,
      presence,
      routeProgress,
      travel: isStill || settledFor < 0 ? null : (settledFor / travelMs) % 1,
      ringAngle: isStill ? 0 : (2 * Math.PI * elapsed) / GLOBE_TIMINGS.ringTurnMs,
      dashOffset: isStill ? 0 : ((elapsed / GLOBE_TIMINGS.dashMs) * DASH_PERIOD_PX) % 1e6,
      seconds: isStill ? 0 : elapsed / 1000,
    })
  }

  // Single frame, or the running loop, capped once settled
  private request = (session: GlobeSession, isUrgent = true): void => {
    session.isUrgent ||= isUrgent
    if (session.frameId !== 0) return

    const tick = (now: number) => {
      session.frameId = 0
      const isMoving = !session.options.isStill || session.pointer !== null
      const isIdle = !session.isUrgent && session.pointer === null

      if (isIdle && now - session.paintedAt < GLOBE_GEOMETRY.idleFrameMs) {
        if (isMoving && session.isVisible && !document.hidden) this.request(session, false)

        return
      }

      session.isUrgent = false
      session.paintedAt = now
      this.paint(session, now)
      if (isMoving && session.isVisible && !document.hidden) this.request(session, false)
    }
    session.frameId = requestAnimationFrame(tick)
  }

  private observe = (session: GlobeSession): (() => void) => {
    const { canvas } = session.options
    const resizing = new ResizeObserver(() => this.resize(session))
    const viewing = new IntersectionObserver(([entry]) => {
      session.isVisible = entry?.isIntersecting ?? true
      this.request(session)
    })
    const refreshInks = () => {
      session.palette = this.readPalette(session.options.canvas)
      this.request(session)
    }
    const theming = new MutationObserver(refreshInks)
    const stopSystem = ThemeService.watchSystem(refreshInks)
    const onVisibility = () => this.request(session)

    resizing.observe(canvas)
    viewing.observe(canvas)
    theming.observe(document.documentElement, { attributeFilter: ['data-theme'] })
    document.addEventListener('visibilitychange', onVisibility)
    document.fonts?.ready.then(refreshInks)

    return () => {
      resizing.disconnect()
      viewing.disconnect()
      theming.disconnect()
      stopSystem()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }

  private listen = (session: GlobeSession): (() => void) => {
    const { canvas } = session.options
    const { dragDegreesPerPx, dragLimitDegrees } = GLOBE_GEOMETRY
    const clamp = (value: number) => Math.max(-dragLimitDegrees, Math.min(dragLimitDegrees, value))

    const onDown = (event: PointerEvent) => {
      // Resume from the current spring position
      session.drag = offsetOf(session, performance.now())
      session.pointer = { x: event.clientX, y: event.clientY }
      canvas.setPointerCapture(event.pointerId)
      this.request(session)
    }
    const onMove = (event: PointerEvent) => {
      if (!session.pointer) return
      session.drag = {
        longitude: clamp(
          session.drag.longitude - (event.clientX - session.pointer.x) * dragDegreesPerPx
        ),
        latitude: clamp(
          session.drag.latitude + (event.clientY - session.pointer.y) * dragDegreesPerPx
        ),
      }
      session.pointer = { x: event.clientX, y: event.clientY }
      this.request(session)
    }
    const onUp = () => {
      if (!session.pointer) return
      session.pointer = null
      session.releasedAt = session.options.isStill ? null : performance.now()
      this.request(session)
    }

    canvas.addEventListener('pointerdown', onDown)
    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerup', onUp)
    canvas.addEventListener('pointercancel', onUp)

    return () => {
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerup', onUp)
      canvas.removeEventListener('pointercancel', onUp)
    }
  }
}

// Interactive engraved globe
export const GlobeService = new GlobeServiceClass('globe')
