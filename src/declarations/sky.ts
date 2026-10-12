/**
 * Deep space backdrop
 * @type {Object}
 */

export const STARFIELD = {
  fieldOfView: 60,
  // Scattered stars, then the galactic band
  count: 5200,
  bandCount: 2200,
  // Star cloud depth, world units
  near: 6,
  far: 160,
  spread: 140,
  // Band tilt, radians
  bandTilt: -0.42,
  bandWidth: 9,
  // Camera dolly over the whole scroll
  travel: 46,
  // Pointer parallax, radians
  parallax: 0.045,
  // Pointer follow, share per frame
  follow: 0.06,
  // Slow drift, radians per second
  drift: 0.004,
  // Point size in pixels at depth one
  size: 95,
  maxPixelRatio: 1.75,
  seed: 7,
} as const

/**
 * Star colours, cool to warm
 * @type {Array<[number, number, number]>}
 */

export const STAR_TINTS: Array<[number, number, number]> = [
  [0.72, 0.8, 1],
  [0.9, 0.93, 1],
  [1, 1, 1],
  [1, 0.94, 0.82],
  [1, 0.8, 0.6],
]
