import { GLOBE_PLANET, GLOBE_TEXTURES } from '@/declarations/globe'
import { Service } from '@/structures/Service'
import type { GlobeCamera } from '@/types/globe'

// Sampled map size
const MAP_WIDTH = 1024
const MAP_HEIGHT = 512
// Rendered disc cap, upscaled after
const MAX_SIDE_PX = 360
const AMBIENT = 0.18

interface FallbackDisc {
  centerX: number
  centerY: number
  radius: number
  camera: GlobeCamera
  presence: number
}

class PlanetFallbackServiceClass extends Service {
  private map: Uint8ClampedArray | null = null
  private isLoading = false
  private buffer: HTMLCanvasElement | null = null
  private sun = (() => {
    const [x, y, z] = GLOBE_PLANET.sunView
    const length = Math.hypot(x, y, z)

    return [x / length, y / length, z / length] as const
  })()

  /**
   * Textured disc without WebGL
   * @param {CanvasRenderingContext2D} context - Target context
   * @param {FallbackDisc} disc - Placement and camera
   * @return {boolean} - Drawn, false while the map loads
   */

  draw = (context: CanvasRenderingContext2D, disc: FallbackDisc): boolean => {
    const map = this.load()
    if (!map) return false

    const side = Math.max(2, Math.min(MAX_SIDE_PX, Math.round(disc.radius * 2)))
    const buffer = (this.buffer ??= document.createElement('canvas'))
    if (buffer.width !== side) {
      buffer.width = side
      buffer.height = side
    }
    const bufferContext = buffer.getContext('2d')
    if (!bufferContext) return false

    const image = bufferContext.createImageData(side, side)
    this.paint(image.data, side, map, disc.camera)
    bufferContext.putImageData(image, 0, 0)

    const { centerX, centerY, radius } = disc
    context.save()
    context.globalAlpha = disc.presence
    this.drawGlow(context, disc)
    context.imageSmoothingQuality = 'high'
    context.drawImage(buffer, centerX - radius, centerY - radius, radius * 2, radius * 2)
    context.restore()

    return true
  }

  // Inverse orthographic, per pixel
  private paint = (
    pixels: Uint8ClampedArray,
    side: number,
    map: Uint8ClampedArray,
    camera: GlobeCamera
  ): void => {
    const { sinLongitude, cosLongitude, sinLatitude, cosLatitude } = camera
    const [sunX, sunY, sunZ] = this.sun

    for (let row = 0; row < side; row += 1) {
      const up = 1 - ((row + 0.5) / side) * 2
      for (let column = 0; column < side; column += 1) {
        const across = ((column + 0.5) / side) * 2 - 1
        const squared = across * across + up * up
        if (squared > 1) continue

        const depth = Math.sqrt(1 - squared)
        const forward = depth * cosLatitude - up * sinLatitude
        const z = up * cosLatitude + depth * sinLatitude
        const x = forward * cosLongitude - across * sinLongitude
        const y = forward * sinLongitude + across * cosLongitude

        const u = Math.atan2(y, x) / (2 * Math.PI) + 0.5
        const v = 0.5 - Math.asin(Math.max(-1, Math.min(1, z))) / Math.PI
        const source =
          (Math.min(MAP_HEIGHT - 1, Math.floor(v * MAP_HEIGHT)) * MAP_WIDTH +
            (Math.floor(u * MAP_WIDTH) % MAP_WIDTH)) *
          4

        // View space light, soft limb
        const light = Math.max(0, across * sunX + up * sunY + depth * sunZ)
        const shade = AMBIENT + (1 - AMBIENT) * light
        const edge = Math.min(1, (1 - Math.sqrt(squared)) * side * 0.5)
        const target = (row * side + column) * 4
        pixels[target] = (map[source] ?? 0) * shade + 20 * (1 - depth)
        pixels[target + 1] = (map[source + 1] ?? 0) * shade + 50 * (1 - depth)
        pixels[target + 2] = (map[source + 2] ?? 0) * shade + 110 * (1 - depth)
        pixels[target + 3] = 255 * edge
      }
    }
  }

  private drawGlow = (context: CanvasRenderingContext2D, disc: FallbackDisc): void => {
    const { centerX, centerY, radius } = disc
    const reach = radius * GLOBE_PLANET.atmosphereReach
    const glow = context.createRadialGradient(
      centerX,
      centerY,
      radius * 0.98,
      centerX,
      centerY,
      reach
    )
    glow.addColorStop(0, 'rgb(120 180 255 / 0.55)')
    glow.addColorStop(1, 'rgb(46 115 255 / 0)')
    context.fillStyle = glow
    context.beginPath()
    context.arc(centerX, centerY, reach, 0, Math.PI * 2)
    context.fill()
  }

  // Day map pixels, once
  private load = (): Uint8ClampedArray | null => {
    if (this.map || this.isLoading) return this.map
    this.isLoading = true

    const image = new Image()
    image.decoding = 'async'
    image.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = MAP_WIDTH
      canvas.height = MAP_HEIGHT
      const context = canvas.getContext('2d', { willReadFrequently: true })
      if (!context) return
      context.drawImage(image, 0, 0, MAP_WIDTH, MAP_HEIGHT)
      this.map = context.getImageData(0, 0, MAP_WIDTH, MAP_HEIGHT).data
    }
    image.onerror = () => {
      this.isLoading = false
      this.logger.warn('texture', GLOBE_TEXTURES.day)
    }
    image.src = GLOBE_TEXTURES.day

    return null
  }
}

// CPU planet when WebGL is out of reach
export const PlanetFallbackService = new PlanetFallbackServiceClass('planetFallback')
