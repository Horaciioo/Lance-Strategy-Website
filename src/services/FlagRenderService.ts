import { GLOBE_FLAG_GEOMETRY, GLOBE_FLAGS } from '@/declarations/globe'
import { Service } from '@/structures/Service'
import type { GlobeFlagId, GlobeFrame, GlobePoint, PreparedPlace } from '@/types/globe'
import { project } from '@/utils/geo'
import { clampUnit } from '@/utils/motion'

const { poleShare, poleMinPx, poleMaxPx, clothShare, aspect, strips, waveShare } =
  GLOBE_FLAG_GEOMETRY
const { textureWidth, textureHeight, waveSpeed, waveSpread } = GLOBE_FLAG_GEOMETRY

// Edge fade, depth units
const FADE_DEPTH = 0.2
const POLE_PX = 1.8
const KNOB_PX = 2.2
// Texture units across the flag, 30 by 20
const GRID_UNIT = textureWidth / 30
const STAR_INNER = 0.382
const STAR_POINTS = 5

// Star centre and radius on the 30 by 20 grid
const CHINA_STARS = [
  { x: 5, y: 5, radius: 3 },
  { x: 10, y: 2, radius: 1 },
  { x: 12, y: 4, radius: 1 },
  { x: 12, y: 7, radius: 1 },
  { x: 10, y: 9, radius: 1 },
] as const

const textures = new Map<GlobeFlagId, HTMLCanvasElement>()

// Five pointed star, one tip towards a target
const starPath = (
  context: CanvasRenderingContext2D,
  star: { x: number; y: number; radius: number },
  aim: number
): void => {
  context.beginPath()
  for (let step = 0; step < STAR_POINTS * 2; step++) {
    const radius = step % 2 === 0 ? star.radius : star.radius * STAR_INNER
    const angle = aim + (step * Math.PI) / STAR_POINTS
    const x = (star.x + radius * Math.cos(angle)) * GRID_UNIT
    const y = (star.y + radius * Math.sin(angle)) * GRID_UNIT
    if (step === 0) context.moveTo(x, y)
    else context.lineTo(x, y)
  }
  context.closePath()
  context.fill()
}

const paintFrance = (context: CanvasRenderingContext2D): void => {
  GLOBE_FLAGS.france.colors.forEach((color, band) => {
    context.fillStyle = color
    context.fillRect((band * textureWidth) / 3, 0, textureWidth / 3 + 1, textureHeight)
  })
}

const paintChina = (context: CanvasRenderingContext2D): void => {
  const [field, star] = GLOBE_FLAGS.china.colors
  context.fillStyle = field
  context.fillRect(0, 0, textureWidth, textureHeight)
  context.fillStyle = star
  const [big, ...small] = CHINA_STARS
  if (!big) return
  starPath(context, big, -Math.PI / 2)
  // Each small star points at the big one
  for (const one of small) starPath(context, one, Math.atan2(big.y - one.y, big.x - one.x))
}

const painters: Record<GlobeFlagId, (context: CanvasRenderingContext2D) => void> = {
  france: paintFrance,
  china: paintChina,
}

// Flag picture, painted once
const textureOf = (id: GlobeFlagId): HTMLCanvasElement => {
  const cached = textures.get(id)
  if (cached) return cached

  const canvas = document.createElement('canvas')
  canvas.width = textureWidth
  canvas.height = textureHeight
  const context = canvas.getContext('2d')
  if (context) painters[id](context)
  textures.set(id, canvas)

  return canvas
}

/**
 * Flag draw request
 * @typedef FlagDraw
 */

export interface FlagDraw {
  frame: GlobeFrame
  place: PreparedPlace
  // Projected foot of the pole
  point: GlobePoint
}

class FlagRenderServiceClass extends Service {
  /**
   * Plant a waving flag
   * @param {FlagDraw} request - Frame, place and foot
   * @return {void}
   */

  draw = ({ frame, place, point }: FlagDraw): void => {
    if (!place.flag) return
    const { context, radius, centerX, centerY } = frame
    const alpha = clampUnit(point.depth / FADE_DEPTH) * frame.presence
    if (alpha <= 0) return

    // Pole runs along the surface normal
    const length = Math.min(poleMaxPx, Math.max(poleMinPx, radius * poleShare))
    const tip = project(place.vector, frame.camera)
    const lift = 1 + length / radius
    const [x, y, z] = place.vector
    const top = project([x * lift, y * lift, z * lift], frame.camera)
    const foot = { x: centerX + tip.x * radius, y: centerY - tip.y * radius }
    const head = { x: centerX + top.x * radius, y: centerY - top.y * radius }
    const lean = Math.atan2(head.x - foot.x, foot.y - head.y)

    context.save()
    context.globalAlpha = alpha
    this.drawPole(frame, foot, head)
    context.translate(head.x, head.y)
    context.rotate(lean)
    this.drawCloth(frame, place.flag, length * clothShare)
    context.restore()
  }

  // Slim white mast with a bright knob
  private drawPole = (
    frame: GlobeFrame,
    foot: { x: number; y: number },
    head: { x: number; y: number }
  ): void => {
    const { context } = frame
    context.beginPath()
    context.moveTo(foot.x, foot.y)
    context.lineTo(head.x, head.y)
    context.lineWidth = POLE_PX + 2
    context.strokeStyle = `rgb(${frame.palette.labelHalo} / 0.55)`
    context.stroke()
    context.lineWidth = POLE_PX
    context.strokeStyle = `rgb(${frame.palette.label})`
    context.stroke()
    context.beginPath()
    context.arc(head.x, head.y, KNOB_PX, 0, Math.PI * 2)
    context.fillStyle = `rgb(${frame.palette.air})`
    context.fill()
  }

  // Cloth in vertical strips, rippling away from the pole
  private drawCloth = (frame: GlobeFrame, id: GlobeFlagId, height: number): void => {
    const { context } = frame
    const texture = textureOf(id)
    const width = height * aspect
    const stripWidth = width / strips
    const source = textureWidth / strips

    for (let strip = 0; strip < strips; strip++) {
      const reach = strip / (strips - 1)
      const phase = strip * waveSpread - frame.seconds * waveSpeed
      const lift = Math.sin(phase) * height * waveShare * reach
      const x = strip * stripWidth

      context.drawImage(
        texture,
        strip * source,
        0,
        source + 1,
        textureHeight,
        x,
        lift,
        stripWidth + 0.6,
        height
      )
      // Folds catch the light or fall in shade
      const shade = Math.cos(phase) * 0.22 * reach
      context.fillStyle = shade > 0 ? `rgb(255 255 255 / ${shade})` : `rgb(0 0 0 / ${-shade})`
      context.fillRect(x, lift, stripWidth + 0.6, height)
    }
  }
}

// Planted flags painter
export const FlagRenderService = new FlagRenderServiceClass('flagRender')
