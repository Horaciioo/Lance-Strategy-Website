import { FLIGHT_COLORS, FUSELAGE_PROFILE } from '@/declarations/flight'
import { ConfigurationService } from '@/services/ConfigurationService'
import { Service } from '@/structures/Service'

// Texture sheet, axis along the canvas height
const AROUND = 1024
const ALONG = 4096
const SIDE_CENTERS = [AROUND * 0.25, AROUND * 0.75]
// Drawing unit, a thousandth of the plane scale
const UNIT = 1000
const TAIL = FUSELAGE_PROFILE[0]?.[1] ?? 0
const LENGTH = (FUSELAGE_PROFILE.at(-1)?.[1] ?? 1) - TAIL
const RADIUS = Math.max(...FUSELAGE_PROFILE.map(([radius]) => radius))
const PX_ALONG = ALONG / LENGTH / UNIT
const PX_AROUND = AROUND / (Math.PI * 2 * RADIUS) / UNIT

// Side features, plane units: axial position, height above the side line
const WINDOWS = { from: -1310, to: 1500, step: 50, rise: 52, width: 17, height: 25 }
const WING_GAP = [-90, 150]
const DOORS = [
  { at: 1640, width: 52, height: 105 },
  { at: -1420, width: 50, height: 102 },
]
const EXITS = [-140, -60]
const COCKPIT = { at: 1940, rise: 62 }
const COCKPIT_PANES: Array<[number, number]> = [
  [-118, -74],
  [-66, -10],
]
const BELLY_DROP = 80
const CHEAT_DROP = 62
const TITLE = { at: 250, rise: 118, size: 60 }
const PANEL_STEP = 140
const FONT = '"Helvetica Neue", Helvetica, Arial, sans-serif'

type Context = CanvasRenderingContext2D

/**
 * Painted fuselage sheets
 * @typedef Livery
 * @property {HTMLCanvasElement} skin - Colour map
 * @property {HTMLCanvasElement} glow - Lit cabin windows
 */

export interface Livery {
  skin: HTMLCanvasElement
  glow: HTMLCanvasElement
}

const sheetOf = (): [HTMLCanvasElement, Context | null] => {
  const canvas = document.createElement('canvas')
  canvas.width = AROUND
  canvas.height = ALONG

  return [canvas, canvas.getContext('2d')]
}

// Plane units on one side, axial right, height up
const onSide = (context: Context, center: number, isPort: boolean, paint: () => void) => {
  const up = isPort ? 1 : -1
  context.save()
  context.setTransform(0, -PX_ALONG, up * PX_AROUND, 0, center, ALONG + TAIL * UNIT * PX_ALONG)
  paint()
  context.restore()
}

const paintWindows = (context: Context, color: string, hasCockpit: boolean) => {
  const { from, to, step, rise, width, height } = WINDOWS
  context.fillStyle = color
  for (let at = from; at < to; at += step) {
    const isDoor = DOORS.some((door) => Math.abs(at - door.at) < door.width + step / 2)
    if (isDoor || (at > (WING_GAP[0] ?? 0) && at < (WING_GAP[1] ?? 0))) continue
    context.beginPath()
    context.roundRect(at, rise - height / 2, width, height, width / 2)
    context.fill()
  }

  if (!hasCockpit) return

  // Cockpit panes, raked back
  const { at, rise: top } = COCKPIT
  COCKPIT_PANES.forEach(([from, to]) => {
    context.beginPath()
    context.moveTo(at + from, top + 22)
    context.lineTo(at + to, top + 22)
    context.lineTo(at + to + 14, top - 26)
    context.lineTo(at + from + 6, top - 26)
    context.fill()
  })
}

class LiveryServiceClass extends Service {
  /**
   * Fuselage sheets
   * @return {Livery} - Colour and glow
   */

  fuselage = (): Livery => {
    const [skin, context] = sheetOf()
    const [glow, glowContext] = sheetOf()

    // Night cabin, lit windows only
    if (glowContext) {
      glowContext.fillStyle = FLIGHT_COLORS.unlit
      glowContext.fillRect(0, 0, AROUND, ALONG)
      SIDE_CENTERS.forEach((center, index) =>
        onSide(glowContext, center, index === 1, () =>
          paintWindows(glowContext, FLIGHT_COLORS.cabinLight, false)
        )
      )
    }
    if (!context) return { skin, glow }

    // White crown, grey belly between both sides
    context.fillStyle = FLIGHT_COLORS.body
    context.fillRect(0, 0, AROUND, ALONG)
    const belly = BELLY_DROP * UNIT * PX_AROUND
    context.fillStyle = FLIGHT_COLORS.belly
    context.fillRect(AROUND * 0.25 + belly, 0, AROUND * 0.5 - belly * 2, ALONG)

    // Faint panel seams around the body
    context.fillStyle = FLIGHT_COLORS.seam
    for (let row = PANEL_STEP; row < ALONG; row += PANEL_STEP) context.fillRect(0, row, AROUND, 2)

    SIDE_CENTERS.forEach((center, index) =>
      onSide(context, center, index === 1, () => this.paintSide(context, index === 1))
    )

    return { skin, glow }
  }

  private paintSide = (context: Context, isPort: boolean) => {
    paintWindows(context, FLIGHT_COLORS.glass, true)

    // Doors and overwing exits, outlined
    context.strokeStyle = FLIGHT_COLORS.seamStrong
    context.lineWidth = 4
    for (const { at, width, height } of DOORS) {
      context.beginPath()
      context.roundRect(at - width / 2, WINDOWS.rise + 30 - height, width, height, 14)
      context.stroke()
    }
    for (const at of EXITS) {
      context.beginPath()
      context.roundRect(at, WINDOWS.rise - 26, 30, 52, 8)
      context.stroke()
    }

    // Pinstripe over the belly, then the accent line
    context.fillStyle = FLIGHT_COLORS.ink
    context.fillRect(TAIL * UNIT, -BELLY_DROP - 4, LENGTH * UNIT, 8)
    context.fillStyle = FLIGHT_COLORS.accent
    context.fillRect(TAIL * UNIT, -CHEAT_DROP - 6, LENGTH * UNIT, 10)

    // Name above the windows, read nose first on both sides
    context.save()
    context.translate(TITLE.at, TITLE.rise)
    context.scale(isPort ? -1 : 1, -1)
    context.fillStyle = FLIGHT_COLORS.ink
    context.font = `700 ${TITLE.size}px ${FONT}`
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText(ConfigurationService.site.name.toUpperCase(), 0, 0)
    context.restore()
  }
}

// Painted textures
export const LiveryService = new LiveryServiceClass('livery')
