import { GLOBE_GEOMETRY, GLOBE_VEHICLES } from '@/declarations/globe'
import { PlanetFallbackService } from '@/services/PlanetFallbackService'
import { VehicleRenderService } from '@/services/VehicleRenderService'
import { Service } from '@/structures/Service'
import type { GlobeFrame, GlobeInk, GlobePoint, PreparedRoute, Vector } from '@/types/globe'
import { project, toRadians } from '@/utils/geo'
import { clampUnit, easeInOutCubic } from '@/utils/motion'

const {
  ringRadius,
  ringFlatness,
  ringTiltDegrees,
  ringTickDegrees,
  ringMajorEvery,
  vehicleShare,
  vehicleMinPx,
  vehicleMaxPx,
} = GLOBE_GEOMETRY

// Route stagger shares
const ROUTE_STAGGER = 0.22
const ROUTE_SPAN = 0.56

// Glow layers under a route, width then opacity
const ROUTE_GLOW = [
  [8, 0.1],
  [4.5, 0.22],
] as const

const LABEL_GAP_PX = 11
const PLACE_PULSE_PX = 14
const PLACE_PULSE_PERIOD = 90

const RING_SEGMENTS = 180
// Heading probe
const HEADING_PROBE = 0.012
// Ground shadow offset, share of the size
const SHADOW_SHARE = { air: 0.55, sea: 0.12, road: 0.1 } as const
// Contrail length and samples
const CONTRAIL_SPAN = 0.07
const CONTRAIL_STEPS = 14

interface ScreenPoint {
  x: number
  y: number
}

const inkOf = (frame: GlobeFrame, ink: GlobeInk, alpha = 1): string =>
  `rgb(${frame.palette[ink]} / ${alpha})`

const toScreen = (frame: GlobeFrame, point: GlobePoint): ScreenPoint => ({
  x: frame.centerX + point.x * frame.radius,
  y: frame.centerY - point.y * frame.radius,
})

// Front hemisphere, or lifted past the limb
const isShown = (point: GlobePoint): boolean =>
  point.depth > 0 || point.x * point.x + point.y * point.y > 1

// Partial path by arc length
const partialOf = (route: PreparedRoute, share: number): Vector[] => {
  const target = share * (route.lengths.at(-1) ?? 0)
  const end = route.lengths.findIndex((length) => length >= target)
  if (end <= 0) return share > 0 ? route.points : []

  // Interpolated tip
  const before = route.points[end - 1]
  const after = route.points[end]
  const from = route.lengths[end - 1]
  const to = route.lengths[end]
  if (!before || !after || from === undefined || to === undefined) return route.points
  const local = (target - from) / (to - from || 1)
  const tip: Vector = [
    before[0] + (after[0] - before[0]) * local,
    before[1] + (after[1] - before[1]) * local,
    before[2] + (after[2] - before[2]) * local,
  ]

  return [...route.points.slice(0, end), tip]
}

const traceInto = (path: Path2D, frame: GlobeFrame, points: Vector[]): void => {
  let isDrawing = false

  for (const vector of points) {
    const point = project(vector, frame.camera)
    const screen = toScreen(frame, point)

    // Break at the horizon
    if (!isShown(point)) {
      isDrawing = false
      continue
    }
    if (isDrawing) path.lineTo(screen.x, screen.y)
    else path.moveTo(screen.x, screen.y)
    isDrawing = true
  }
}

const ringPointOf = (frame: GlobeFrame, angle: number, reach = 1) => {
  const tilt = toRadians(ringTiltDegrees)
  const flatDepth = Math.sqrt(1 - ringFlatness * ringFlatness)
  const size = frame.radius * ringRadius * reach
  const along = Math.cos(angle)
  const across = Math.sin(angle) * ringFlatness

  return {
    x: frame.centerX + size * (along * Math.cos(tilt) - across * Math.sin(tilt)),
    y: frame.centerY - size * (along * Math.sin(tilt) + across * Math.cos(tilt)),
    depth: Math.sin(angle) * flatDepth,
  }
}

class GlobeRenderServiceClass extends Service {
  /**
   * Paint the vector layer over the GPU planet
   * @param {GlobeFrame} frame - Frame state
   * @return {void}
   */

  draw = (frame: GlobeFrame): void => {
    const { context } = frame

    context.clearRect(0, 0, frame.width, frame.height)
    context.lineCap = 'round'
    context.lineJoin = 'round'

    if (frame.hasRing) this.drawRing(frame, false)
    if (!frame.hasPlanet) this.drawDisc(frame)
    this.drawRoutes(frame)
    this.drawPlaces(frame)
    if (frame.hasRing) this.drawRing(frame, true)
  }

  // Flat disc when the GPU is out of reach
  private drawDisc = (frame: GlobeFrame): void => {
    const { context, radius, centerX, centerY } = frame
    // Textured map once loaded
    if (PlanetFallbackService.draw(context, frame)) return

    const body = context.createRadialGradient(
      centerX - radius * 0.38,
      centerY - radius * 0.42,
      radius * 0.05,
      centerX,
      centerY,
      radius * 1.02
    )
    body.addColorStop(0, inkOf(frame, 'highlight', frame.presence))
    body.addColorStop(1, inkOf(frame, 'shadow', frame.presence))
    context.fillStyle = body
    context.beginPath()
    context.arc(centerX, centerY, radius, 0, Math.PI * 2)
    context.fill()
    context.lineWidth = 1
    context.strokeStyle = inkOf(frame, 'route', 0.85 * frame.presence)
    context.stroke()
  }

  private drawRoutes = (frame: GlobeFrame): void => {
    const { context } = frame

    frame.routes.forEach((route, index) => {
      const share = easeInOutCubic(
        clampUnit((frame.routeProgress - index * ROUTE_STAGGER) / ROUTE_SPAN)
      )
      const path = new Path2D()
      traceInto(path, frame, partialOf(route, share))
      const ink = GLOBE_VEHICLES[route.kind]

      // Soft glow, then the lit line
      context.setLineDash([])
      for (const [width, alpha] of ROUTE_GLOW) {
        context.lineWidth = width
        context.strokeStyle = inkOf(frame, ink, alpha)
        context.stroke(path)
      }
      context.lineWidth = route.kind === 'air' ? 1.8 : 1.6
      context.strokeStyle = inkOf(frame, ink)
      context.setLineDash(route.kind === 'sea' ? [4, 4] : [])
      context.lineDashOffset = -frame.dashOffset
      context.stroke(path)
      context.setLineDash([])

      if (frame.travel !== null && share >= 1) this.drawTraveller(frame, route, index)
    })
  }

  // Detailed vehicle, nose along the route
  private drawTraveller = (frame: GlobeFrame, route: PreparedRoute, index: number): void => {
    const share = ((frame.travel ?? 0) + index * 0.37) % 1
    const tip = partialOf(route, share).at(-1)
    const behind = partialOf(route, Math.max(0, share - HEADING_PROBE)).at(-1)
    if (!tip || !behind) return

    const point = project(tip, frame.camera)
    if (!isShown(point)) return

    const head = toScreen(frame, point)
    const tail = toScreen(frame, project(behind, frame.camera))
    const heading = Math.atan2(head.y - tail.y, head.x - tail.x)
    const size = Math.min(vehicleMaxPx, Math.max(vehicleMinPx, frame.radius * vehicleShare))
    const scale = size / VehicleRenderService.units
    const { context } = frame
    const drop = size * SHADOW_SHARE[route.kind]

    if (route.kind === 'air') this.drawContrail(frame, route, share, size)

    // Shadow cast away from the sun
    context.save()
    context.translate(head.x + drop * 0.6, head.y + drop)
    context.rotate(heading)
    context.scale(scale, scale)
    VehicleRenderService.shadow(context, route.kind)
    context.restore()

    context.save()
    context.translate(head.x, head.y)
    context.rotate(heading)
    context.scale(scale, scale)
    VehicleRenderService.paint(context, route.kind, {
      accent: inkOf(frame, GLOBE_VEHICLES[route.kind]),
      seconds: frame.seconds,
    })
    context.restore()
  }

  // Fading vapour behind the plane
  private drawContrail = (
    frame: GlobeFrame,
    route: PreparedRoute,
    share: number,
    size: number
  ): void => {
    const { context } = frame
    const points = Array.from({ length: CONTRAIL_STEPS + 1 }, (_, step) => {
      const at = Math.max(0, share - CONTRAIL_SPAN * (1 - step / CONTRAIL_STEPS))

      return project(partialOf(route, at).at(-1) ?? route.points[0]!, frame.camera)
    })

    // Oldest segment first, thin and faint
    for (let step = 1; step < points.length; step++) {
      const from = points[step - 1]
      const to = points[step]
      if (!from || !to || !isShown(from) || !isShown(to)) continue
      const age = step / CONTRAIL_STEPS
      const start = toScreen(frame, from)
      const end = toScreen(frame, to)
      context.lineWidth = size * (0.07 + (1 - age) * 0.1)
      context.strokeStyle = `rgb(255 255 255 / ${age * age * 0.55})`
      context.beginPath()
      context.moveTo(start.x, start.y)
      context.lineTo(end.x, end.y)
      context.stroke()
    }
  }

  private drawPlaces = (frame: GlobeFrame): void => {
    const { context } = frame
    const labelAlpha = clampUnit(frame.routeProgress * 3)
    const pulse = (frame.dashOffset % PLACE_PULSE_PERIOD) / PLACE_PULSE_PERIOD

    for (const place of frame.places) {
      const point = project(place.vector, frame.camera)
      if (point.depth <= 0) continue

      // Beacon, expanding ring then a lit dot
      const screen = toScreen(frame, point)
      if (place.label) {
        context.beginPath()
        context.arc(screen.x, screen.y, 4 + pulse * PLACE_PULSE_PX, 0, Math.PI * 2)
        context.lineWidth = 1.2
        context.strokeStyle = inkOf(frame, 'label', (1 - pulse) * 0.55 * frame.presence)
        context.stroke()
      }
      context.beginPath()
      context.arc(screen.x, screen.y, 4.2, 0, Math.PI * 2)
      context.fillStyle = inkOf(frame, 'label', frame.presence)
      context.fill()
      context.lineWidth = 1.2
      context.strokeStyle = inkOf(frame, 'labelHalo', frame.presence)
      context.stroke()
      context.beginPath()
      context.arc(screen.x, screen.y, 1.6, 0, Math.PI * 2)
      context.fillStyle = inkOf(frame, 'air', frame.presence)
      context.fill()

      if (place.label && labelAlpha > 0) this.drawLabel(frame, place.label, screen, labelAlpha)
    }
  }

  private drawLabel = (
    frame: GlobeFrame,
    label: { name: string; counterpart: string },
    screen: ScreenPoint,
    alpha: number
  ): void => {
    const { context } = frame
    // Flip side rather than clip
    context.font = `600 13px ${frame.fontFamily}`
    const reach = LABEL_GAP_PX + context.measureText(label.name).width
    const isLeftHalf = screen.x < frame.centerX
    const isLeft = isLeftHalf ? screen.x - reach >= 0 : screen.x + reach > frame.width
    const x = screen.x + (isLeft ? -LABEL_GAP_PX : LABEL_GAP_PX)

    context.textAlign = isLeft ? 'right' : 'left'
    context.textBaseline = 'alphabetic'
    context.lineWidth = 3.5
    context.strokeStyle = inkOf(frame, 'labelHalo', alpha * 0.9)

    // White name over its counterpart, haloed to read on the imagery
    const lines: [string, string, number][] = [
      [`600 13px ${frame.fontFamily}`, label.name, -7],
      [`400 12px ${frame.fontFamily}`, label.counterpart, 8],
    ]
    for (const [font, text, offset] of lines) {
      context.font = font
      context.strokeText(text, x, screen.y + offset)
      context.fillStyle = inkOf(frame, 'label', alpha)
      context.fillText(text, x, screen.y + offset)
    }
  }

  private drawRing = (frame: GlobeFrame, isFront: boolean): void => {
    const { context } = frame
    const reach = Math.PI * 2 * frame.presence
    const arc = new Path2D()
    const ticks = new Path2D()

    // Ellipse half
    for (let step = 0; step <= RING_SEGMENTS; step++) {
      const angle = (step / RING_SEGMENTS) * reach
      const point = ringPointOf(frame, angle)
      const isShownHalf = point.depth >= 0 === isFront
      if (!isShownHalf || step === 0) arc.moveTo(point.x, point.y)
      else arc.lineTo(point.x, point.y)
    }

    // Graduations, turning slowly
    const tickCount = 360 / ringTickDegrees
    for (let tick = 0; tick < tickCount; tick++) {
      const angle = frame.ringAngle + toRadians(tick * ringTickDegrees)
      if (angle % (Math.PI * 2) > reach) continue

      const inner = ringPointOf(frame, angle)
      if (inner.depth >= 0 !== isFront) continue
      const outer = ringPointOf(frame, angle, tick % ringMajorEvery === 0 ? 1.05 : 1.025)
      ticks.moveTo(inner.x, inner.y)
      ticks.lineTo(outer.x, outer.y)
    }

    // Front half cuts the engraving
    if (isFront) {
      context.lineWidth = 3
      context.strokeStyle = inkOf(frame, 'highlight', frame.presence)
      context.stroke(arc)
    }
    context.lineWidth = 0.8
    context.strokeStyle = inkOf(frame, 'ring', 0.9)
    context.stroke(arc)
    context.lineWidth = 0.7
    context.stroke(ticks)
  }
}

// Globe vector layer painter
export const GlobeRenderService = new GlobeRenderServiceClass('globeRender')
