import { FLIGHT } from '@/declarations/flight'
import { Service } from '@/structures/Service'
import type { FlightKeyframe, FlightSize } from '@/types/flight'
import { flightPhaseOf, flightPointAt } from '@/utils/flightPath'

// Plane size at the closest depth, share of the stage height
const GLYPH_SHARE = 0.34
const NEAREST_DEPTH = 12
const HEADING_PROBE = 0.02
const TRAIL_POINTS = 28
const DEGREES = 180 / Math.PI

/**
 * Flat flight elements
 * @typedef SketchParts
 * @property {SVGSVGElement} plane - Plane glyph
 * @property {SVGPolylineElement} trail - Contrail line
 */

export interface SketchParts {
  plane: SVGSVGElement
  trail: SVGPolylineElement
}

class SketchServiceClass extends Service {
  /**
   * Flat flight, when WebGL is out of reach
   * @param {Object} input - Frame inputs
   * @param {FlightKeyframe[]} input.keys - Outbound key points
   * @param {number} input.progress - Scroll share
   * @param {FlightSize} input.size - Stage geometry
   * @param {SketchParts} input.parts - Elements to move
   * @return {void}
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
  }): void => {
    const { leg, share } = flightPhaseOf(progress)
    const screenOf = (at: number) => {
      const point = flightPointAt(keys, at)

      return {
        x: ((point.x + 1) / 2) * size.width,
        y: ((1 - point.y) / 2) * size.height,
        depth: point.depth,
      }
    }
    const { plane, trail } = parts
    const isFlying = leg !== 'gap' && progress > 0
    plane.style.opacity = isFlying ? '1' : '0'
    if (!isFlying) {
      trail.setAttribute('points', '')

      return
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

    // Contrail on the way out
    const first = Math.max(0, share - FLIGHT.trailSpan)
    trail.setAttribute(
      'points',
      Array.from({ length: TRAIL_POINTS }, (_, step) => {
        const point = screenOf(first + ((share - first) * step) / (TRAIL_POINTS - 1))

        return `${point.x.toFixed(1)},${point.y.toFixed(1)}`
      }).join(' ')
    )
  }
}

// Flat flight placement
export const SketchService = new SketchServiceClass('sketch')
