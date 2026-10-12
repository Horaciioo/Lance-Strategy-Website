import type { GlobeCamera, GlobeCoordinate, GlobePoint, Vector } from '@/types/globe'

const DEGREE = Math.PI / 180

/**
 * Degrees to radians
 * @param {number} degrees - Angle
 * @return {number} - Radians
 */

export const toRadians = (degrees: number): number => degrees * DEGREE

/**
 * Radians to degrees
 * @param {number} radians - Angle
 * @return {number} - Degrees
 */

export const toDegrees = (radians: number): number => radians / DEGREE

/**
 * Sphere vector
 * @param {GlobeCoordinate} coordinate - Position
 * @return {Vector} - Unit vector
 */

export const vectorOf = ({ longitude, latitude }: GlobeCoordinate): Vector => {
  const lambda = longitude * DEGREE
  const phi = latitude * DEGREE

  return [Math.cos(phi) * Math.cos(lambda), Math.cos(phi) * Math.sin(lambda), Math.sin(phi)]
}

/**
 * Dot product
 * @param {Vector} a - First vector
 * @param {Vector} b - Second vector
 * @return {number} - Product
 */

export const dot = (a: Vector, b: Vector): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]

const scale = (vector: Vector, factor: number): Vector => [
  vector[0] * factor,
  vector[1] * factor,
  vector[2] * factor,
]

const normalize = (vector: Vector): Vector => scale(vector, 1 / Math.hypot(...vector))

/**
 * Angle between vectors
 * @param {Vector} a - First vector
 * @param {Vector} b - Second vector
 * @return {number} - Radians
 */

export const angleBetween = (a: Vector, b: Vector): number =>
  Math.acos(Math.min(1, Math.max(-1, dot(normalize(a), normalize(b)))))

/**
 * Camera facing a coordinate
 * @param {GlobeCoordinate} view - Centre point
 * @return {GlobeCamera} - Camera
 */

export const cameraOf = ({ longitude, latitude }: GlobeCoordinate): GlobeCamera => ({
  sinLongitude: Math.sin(longitude * DEGREE),
  cosLongitude: Math.cos(longitude * DEGREE),
  sinLatitude: Math.sin(latitude * DEGREE),
  cosLatitude: Math.cos(latitude * DEGREE),
})

/**
 * Orthographic projection
 * @param {Vector} vector - Sphere vector
 * @param {GlobeCamera} camera - Camera
 * @return {GlobePoint} - Projected point
 */

export const project = ([x, y, z]: Vector, camera: GlobeCamera): GlobePoint => {
  const forward = x * camera.cosLongitude + y * camera.sinLongitude
  const side = -x * camera.sinLongitude + y * camera.cosLongitude

  return {
    x: side,
    y: z * camera.cosLatitude - forward * camera.sinLatitude,
    depth: z * camera.sinLatitude + forward * camera.cosLatitude,
  }
}

/**
 * Great circle interpolation
 * @param {Vector} a - Start
 * @param {Vector} b - End
 * @param {number} share - Progress
 * @return {Vector} - Point
 */

export const slerp = (a: Vector, b: Vector, share: number): Vector => {
  const omega = angleBetween(a, b)
  if (omega < 1e-6) return a

  // Spherical weights
  const sinOmega = Math.sin(omega)
  const first = Math.sin((1 - share) * omega) / sinOmega
  const second = Math.sin(share * omega) / sinOmega

  return [a[0] * first + b[0] * second, a[1] * first + b[1] * second, a[2] * first + b[2] * second]
}

/**
 * Densified great circle path
 * @param {Vector[]} stops - Waypoints
 * @param {number} stepDegrees - Sample step
 * @return {Vector[]} - Points
 */

export const pathThrough = (stops: Vector[], stepDegrees: number): Vector[] =>
  stops.slice(1).flatMap((stop, index) => {
    const start = stops[index] ?? stop
    const count = Math.max(1, Math.ceil(toDegrees(angleBetween(start, stop)) / stepDegrees))

    // Skip shared joints
    return Array.from({ length: count + (index === 0 ? 1 : 0) }, (_, step) =>
      slerp(start, stop, (step + (index === 0 ? 0 : 1)) / count)
    )
  })

/**
 * Chaikin corner cutting
 * @param {Vector[]} points - Path
 * @param {number} iterations - Passes
 * @return {Vector[]} - Smoothed path
 */

export const smoothPath = (points: Vector[], iterations: number): Vector[] => {
  let current = points

  for (let pass = 0; pass < iterations; pass++) {
    const first = current[0]
    const last = current.at(-1)
    if (!first || !last) return current

    const inner = current.slice(1).flatMap((point, index) => {
      const previous = current[index] ?? point
      const near: Vector = normalize([
        previous[0] * 0.75 + point[0] * 0.25,
        previous[1] * 0.75 + point[1] * 0.25,
        previous[2] * 0.75 + point[2] * 0.25,
      ])
      const far: Vector = normalize([
        previous[0] * 0.25 + point[0] * 0.75,
        previous[1] * 0.25 + point[1] * 0.75,
        previous[2] * 0.25 + point[2] * 0.75,
      ])

      return [near, far]
    })
    current = [first, ...inner.slice(1, -1), last]
  }

  return current
}

/**
 * Raise a path into an arch
 * @param {Vector[]} points - Surface path
 * @param {number} height - Peak altitude
 * @return {Vector[]} - Lifted path
 */

export const liftPath = (points: Vector[], height: number): Vector[] =>
  points.map((point, index) =>
    scale(point, 1 + height * Math.sin((Math.PI * index) / Math.max(1, points.length - 1)))
  )

/**
 * Cumulative chord lengths
 * @param {Vector[]} points - Path
 * @return {number[]} - Running totals
 */

export const lengthsOf = (points: Vector[]): number[] => {
  let total = 0

  return points.map((point, index) => {
    const previous = points[index - 1] ?? point
    total += Math.hypot(point[0] - previous[0], point[1] - previous[1], point[2] - previous[2])

    return total
  })
}
