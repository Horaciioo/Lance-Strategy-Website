import { FLIGHT, FLIGHT_PATH_OUT } from '@/declarations/flight'
import type { FlightKeyframe, FlightPhase } from '@/types/flight'
import { clampUnit } from '@/utils/motion'

/**
 * Outbound key points for a take-off point
 * @param {Object} origin - Take-off point, screen space
 * @param {number} origin.x - Left, -1 to 1
 * @param {number} origin.y - Top, 1 to -1
 * @return {FlightKeyframe[]} - Key points
 */

export const flightKeysOf = (origin: { x: number; y: number }): FlightKeyframe[] =>
  FLIGHT_PATH_OUT.map((key, index) => (index === 0 ? { ...key, x: origin.x, y: origin.y } : key))

/**
 * Leg of the flight and position along it
 * @param {number} progress - Scroll share
 * @return {FlightPhase} - Leg and its own 0 to 1 position
 */

export const flightPhaseOf = (progress: number): FlightPhase => {
  if (progress <= FLIGHT.outEnd) return { leg: 'out', share: clampUnit(progress / FLIGHT.outEnd) }

  return { leg: 'gap', share: 0 }
}

/**
 * Point of a Catmull-Rom spline through the key points
 * @param {FlightKeyframe[]} keys - Key points, evenly spaced
 * @param {number} share - Position along the leg, 0 to 1
 * @return {FlightKeyframe} - Interpolated point
 */

export const flightPointAt = (keys: FlightKeyframe[], share: number): FlightKeyframe => {
  const last = keys.length - 1
  const position = clampUnit(share) * last
  const index = Math.min(Math.floor(position), last - 1)
  const local = position - index
  const [first, second, third, fourth] = [
    keys[Math.max(index - 1, 0)],
    keys[index],
    keys[index + 1],
    keys[Math.min(index + 2, last)],
  ]
  if (!first || !second || !third || !fourth) return keys[0] ?? { x: 0, y: 0, depth: 1 }

  const blend = (a: number, b: number, c: number, d: number): number =>
    0.5 *
    (2 * b +
      (-a + c) * local +
      (2 * a - 5 * b + 4 * c - d) * local ** 2 +
      (-a + 3 * b - 3 * c + d) * local ** 3)

  return {
    x: blend(first.x, second.x, third.x, fourth.x),
    y: blend(first.y, second.y, third.y, fourth.y),
    depth: blend(first.depth, second.depth, third.depth, fourth.depth),
  }
}
