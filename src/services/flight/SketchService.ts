import { FLIGHT, FLIGHT_PATH_BACK } from '@/declarations/flight'
import { Service } from '@/structures/Service'
import type { FlightKeyframe, FlightSize } from '@/types/flight'
import { flightPhaseOf, flightPointAt } from '@/utils/flightPath'

// Plane size at the closest depth, share of the stage height
const GLYPH_SHARE = 0.34
const NEAREST_DEPTH = 12
const HEADING_PROBE = 0.02
const TRAIL_POINTS = 28
const DEGREES = 180 / Math.PI
// Cloth width, share of the stage width
const BANNER_SHARE = 0.55
const BANNER_FLUTTER_DEGREES = 1.4

/**
 * Flat flight elements
 * @typedef SketchParts
 * @property {SVGSVGElement} plane - Plane glyph
 * @property {SVGPolylineElement} trail - Contrail line
 * @property {HTMLElement} banner - Towed cloth
 */

export interface SketchParts {
  plane: SVGSVGElement
  trail: SVGPolylineElement
  banner: HTMLElement
}

class SketchServiceClass extends Service {
  /**
   * Flat flight, when WebGL is out of reach
   * @param {Object} input - Frame inputs
   * @param {FlightKeyframe[]} input.keys - Outbound key points
   * @param {number} input.progress - Scroll share
   * @param {FlightSize} input.size - Stage geometry
   * @param {SketchParts} input.parts - Elements to move
   * @return {number} - Banner tail, share of the stage width
   */

  place = ({
    keys,
    progress,
    size,
    parts,
  }: {
    keys: FlightKeyframe[]
    progress: number
    size: FlightSize
    parts: SketchParts
  }): number => {
    const { leg, share } = flightPhaseOf(progress)
    const path = leg === 'back' ? FLIGHT_PATH_BACK : keys
    const screenOf = (at: number) => {
      const point = flightPointAt(path, at)

      return {
        x: ((point.x + 1) / 2) * size.width,
        y: ((1 - point.y) / 2) * size.height,
        depth: point.depth,
      }
    }
    const { plane, trail, banner } = parts
    const isFlying = leg !== 'gap' && progress > 0
    plane.style.opacity = isFlying ? '1' : '0'
    banner.style.opacity = leg === 'back' ? '1' : '0'
    if (!isFlying) {
      trail.setAttribute('points', '')

      return 0
    }

    const here = screenOf(share)
    const ahead = screenOf(Math.min(1, share + HEADING_PROBE))
    const heading = Math.atan2(ahead.y - here.y, ahead.x - here.x) * DEGREES + 90
    const glyph = Math.min(
      size.height * GLYPH_SHARE * (NEAREST_DEPTH / here.depth),
      size.height * GLYPH_SHARE
    )

    plane.style.width = `${glyph}px`
    plane.style.height = `${glyph}px`
    plane.style.transform = `translate3d(${here.x - glyph / 2}px, ${here.y - glyph / 2}px, 0) rotate(${heading}deg)`

    // Contrail on the way out, cloth on the way back
    const first = Math.max(0, share - FLIGHT.trailSpan)
    trail.setAttribute(
      'points',
      leg === 'out'
        ? Array.from({ length: TRAIL_POINTS }, (_, step) => {
            const point = screenOf(first + ((share - first) * step) / (TRAIL_POINTS - 1))

            return `${point.x.toFixed(1)},${point.y.toFixed(1)}`
          }).join(' ')
        : ''
    )
    if (leg !== 'back') return 0

    const cloth = size.width * BANNER_SHARE
    const flutter = Math.sin(progress * 90) * BANNER_FLUTTER_DEGREES
    banner.style.width = `${cloth}px`
    const tail = here.x - glyph * 0.45 - cloth
    banner.style.transform = `translate3d(${tail}px, ${here.y - banner.offsetHeight / 2}px, 0) rotate(${flutter}deg)`

    return tail / size.width
  }
}

// Flat flight placement
export const SketchService = new SketchServiceClass('sketch')
