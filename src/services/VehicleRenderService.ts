import { GLOBE_VEHICLE_PAINT as PAINT } from '@/declarations/globe'
import { Service } from '@/structures/Service'
import type { GlobeRouteKind } from '@/types/globe'

type Context = CanvasRenderingContext2D
type Painter = (context: Context, accent: string, seconds: number) => void

// Drawing box, nose towards +x
const VEHICLE_UNITS = 48
const OUTLINE = 'rgb(6 14 36 / 0.55)'
const STROBE_HZ = 1.1
const SIDES = [-1, 1] as const

/**
 * Painting request
 * @typedef VehicleStroke
 * @property {string} accent - Route colour
 * @property {number} seconds - Animation clock
 */

export interface VehicleStroke {
  accent: string
  seconds: number
}

const polygon = (context: Context, points: Array<[number, number]>, flip = 1): void => {
  context.beginPath()
  points.forEach(([x, y], index) =>
    index === 0 ? context.moveTo(x, y * flip) : context.lineTo(x, y * flip)
  )
  context.closePath()
}

// Shade across the body
const acrossGradient = (context: Context, half: number, light: string, dark: string) => {
  const gradient = context.createLinearGradient(0, -half, 0, half)
  gradient.addColorStop(0, dark)
  gradient.addColorStop(0.35, light)
  gradient.addColorStop(0.6, light)
  gradient.addColorStop(1, dark)

  return gradient
}

const glow = (context: Context, x: number, y: number, radius: number, color: string) => {
  const gradient = context.createRadialGradient(x, y, 0, x, y, radius)
  gradient.addColorStop(0, PAINT.foam)
  gradient.addColorStop(0.25, color)
  gradient.addColorStop(1, 'rgb(0 0 0 / 0)')
  context.fillStyle = gradient
  context.fillRect(x - radius, y - radius, radius * 2, radius * 2)
}

const fuselagePath = (context: Context): void => {
  context.beginPath()
  context.moveTo(24, 0)
  context.quadraticCurveTo(23, -3.4, 16, -3.4)
  context.lineTo(-16, -3.1)
  context.quadraticCurveTo(-23, -2.4, -24.5, 0)
  context.quadraticCurveTo(-23, 2.4, -16, 3.1)
  context.lineTo(16, 3.4)
  context.quadraticCurveTo(23, 3.4, 24, 0)
  context.closePath()
}

const WING: Array<[number, number]> = [
  [7, -2.6],
  [-5, -22],
  [-9.5, -22.5],
  [-4, -2.6],
]
const STABILISER: Array<[number, number]> = [
  [-15, -1.8],
  [-20.5, -9.5],
  [-23.5, -9.5],
  [-21, -1.8],
]

const paintAir: Painter = (context, accent, seconds) => {
  context.lineWidth = 0.8
  context.strokeStyle = OUTLINE

  // Wings, engines, then tailplane
  for (const side of SIDES) {
    polygon(context, WING, side)
    context.fillStyle = acrossGradient(context, 22, PAINT.skin, PAINT.skinShade)
    context.fill()
    context.stroke()
    context.fillStyle = PAINT.metal
    context.beginPath()
    context.roundRect(-1, side * 9.5 - 1.6, 7.5, 3.2, 1.4)
    context.fill()
    polygon(context, STABILISER, side)
    context.fillStyle = PAINT.skinShade
    context.fill()
    context.stroke()
  }

  // Fuselage, spine stripe, cockpit
  fuselagePath(context)
  context.fillStyle = acrossGradient(context, 3.4, PAINT.skin, PAINT.skinShade)
  context.fill()
  context.stroke()
  context.fillStyle = accent
  context.beginPath()
  context.roundRect(-24, -0.9, 13, 1.8, 0.9)
  context.fill()
  context.fillStyle = PAINT.glass
  context.beginPath()
  context.moveTo(21.6, -1.9)
  context.quadraticCurveTo(23.4, 0, 21.6, 1.9)
  context.lineTo(20.2, 1.4)
  context.quadraticCurveTo(21, 0, 20.2, -1.4)
  context.fill()

  // Wingtip lights, tail strobe
  glow(context, -8.5, -22, 3.4, PAINT.portLight)
  glow(context, -8.5, 22, 3.4, PAINT.starboardLight)
  const strobe = Math.pow(Math.max(0, Math.sin(seconds * Math.PI * 2 * STROBE_HZ)), 18)
  if (strobe > 0.05) glow(context, -24.5, 0, 6 * strobe, PAINT.foam)
}

// Foam wake opening behind the stern
const paintWake = (context: Context, seconds: number): void => {
  const wake = context.createLinearGradient(-22, 0, -62, 0)
  wake.addColorStop(0, 'rgb(255 255 255 / 0.75)')
  wake.addColorStop(1, 'rgb(255 255 255 / 0)')
  context.strokeStyle = wake
  context.lineCap = 'round'
  for (const side of SIDES) {
    context.lineWidth = 1.6
    context.beginPath()
    context.moveTo(-20, side * 6)
    context.quadraticCurveTo(-40, side * 11, -62, side * 19)
    context.stroke()
  }

  // Churned centre line
  context.lineWidth = 3.4 + Math.sin(seconds * 3) * 0.6
  context.beginPath()
  context.moveTo(-23, 0)
  context.lineTo(-54, 0)
  context.stroke()
}

const paintSea: Painter = (context, accent, seconds) => {
  paintWake(context, seconds)

  // Hull with a pointed bow
  context.beginPath()
  context.moveTo(26, 0)
  context.quadraticCurveTo(21, -7, 12, -7)
  context.lineTo(-21, -7)
  context.quadraticCurveTo(-24.5, -7, -24.5, -3.5)
  context.lineTo(-24.5, 3.5)
  context.quadraticCurveTo(-24.5, 7, -21, 7)
  context.lineTo(12, 7)
  context.quadraticCurveTo(21, 7, 26, 0)
  context.fillStyle = acrossGradient(context, 7, PAINT.hull, PAINT.hullShade)
  context.fill()
  context.lineWidth = 0.8
  context.strokeStyle = OUTLINE
  context.stroke()
  context.fillStyle = PAINT.deck
  context.fillRect(-21, -5.6, 41, 11.2)

  // Container bays, two stacks across
  for (let bay = 0; bay < 9; bay++) {
    for (let row = 0; row < 3; row++) {
      context.fillStyle = PAINT.containers[(bay * 3 + row * 5) % PAINT.containers.length] ?? accent
      context.fillRect(-12 + bay * 3.6, -5.2 + row * 3.5, 3.2, 3.2)
    }
  }
  context.fillStyle = 'rgb(255 255 255 / 0.18)'
  context.fillRect(-12, -5.2, 32.4, 1.1)

  // Bridge, windows, funnel
  context.fillStyle = PAINT.cabin
  context.fillRect(-20.5, -6, 6.5, 12)
  context.fillStyle = PAINT.glass
  context.fillRect(-14.8, -5.6, 0.9, 11.2)
  context.fillStyle = accent
  context.fillRect(-19.5, -1.6, 2.6, 3.2)

  // Bow wave
  const surge = 0.7 + Math.sin(seconds * 4) * 0.15
  context.strokeStyle = `rgb(255 255 255 / ${surge})`
  context.lineWidth = 1.2
  context.beginPath()
  context.moveTo(18, -8.4)
  context.quadraticCurveTo(25, -5, 27.5, 0)
  context.quadraticCurveTo(25, 5, 18, 8.4)
  context.stroke()
}

const paintRoad: Painter = (context, accent) => {
  // Headlight beams
  for (const side of SIDES) {
    const beam = context.createLinearGradient(23, 0, 42, 0)
    beam.addColorStop(0, 'rgb(255 243 196 / 0.55)')
    beam.addColorStop(1, 'rgb(255 243 196 / 0)')
    context.fillStyle = beam
    polygon(context, [
      [23, side * 3.2],
      [42, side * 1],
      [42, side * 9],
    ])
    context.fill()
  }

  // Trailer, ribs and band
  context.lineWidth = 0.8
  context.strokeStyle = OUTLINE
  context.beginPath()
  context.roundRect(-25, -5.6, 34, 11.2, 1.2)
  context.fillStyle = acrossGradient(context, 5.6, PAINT.cabin, PAINT.skinShade)
  context.fill()
  context.stroke()
  context.fillStyle = 'rgb(6 14 36 / 0.12)'
  for (let rib = -22; rib < 8; rib += 3) context.fillRect(rib, -5.2, 0.5, 10.4)
  context.fillStyle = accent
  context.fillRect(-12, -5.6, 5, 11.2)

  // Cab, windscreen, mirrors
  context.beginPath()
  context.roundRect(10.5, -5.4, 13, 10.8, [1.2, 3, 3, 1.2])
  context.fillStyle = acrossGradient(context, 5.4, accent, PAINT.hullShade)
  context.fill()
  context.stroke()
  context.fillStyle = 'rgb(255 255 255 / 0.35)'
  context.fillRect(12, -4.2, 4.5, 8.4)
  context.fillStyle = PAINT.glass
  context.beginPath()
  context.roundRect(19, -4.6, 3, 9.2, 1)
  context.fill()
  context.fillRect(18.5, -6.6, 1.2, 1.4)
  context.fillRect(18.5, 5.2, 1.2, 1.4)
  glow(context, 23.2, -3.4, 1.8, PAINT.headlight)
  glow(context, 23.2, 3.4, 1.8, PAINT.headlight)
}

const PAINTERS: Record<GlobeRouteKind, Painter> = {
  air: paintAir,
  sea: paintSea,
  road: paintRoad,
}

class VehicleRenderServiceClass extends Service {
  /**
   * Box size in units
   * @type {number}
   */

  readonly units = VEHICLE_UNITS

  /**
   * Paint one vehicle, centred
   * @param {Context} context - Transformed canvas
   * @param {GlobeRouteKind} kind - Transport mode
   * @param {VehicleStroke} stroke - Colour and clock
   * @return {void}
   */

  paint = (context: Context, kind: GlobeRouteKind, { accent, seconds }: VehicleStroke): void => {
    context.save()
    context.lineJoin = 'round'
    PAINTERS[kind](context, accent, seconds)
    context.restore()
  }

  /**
   * Ground shadow blot
   * @param {Context} context - Transformed canvas
   * @param {GlobeRouteKind} kind - Transport mode
   * @return {void}
   */

  shadow = (context: Context, kind: GlobeRouteKind): void => {
    context.save()
    context.fillStyle = 'rgb(0 0 0 / 0.3)'
    if (kind === 'air') {
      fuselagePath(context)
      context.fill()
      for (const side of SIDES) {
        polygon(context, WING, side)
        context.fill()
      }
    } else {
      context.beginPath()
      context.roundRect(-25, -7, 51, 14, 4)
      context.fill()
    }
    context.restore()
  }
}

// Detailed globe vehicles
export const VehicleRenderService = new VehicleRenderServiceClass('vehicleRender')
