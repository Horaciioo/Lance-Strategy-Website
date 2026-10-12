/**
 * Spring presets, Apple style
 * @type {Object}
 */

export const MOTION_SPRINGS = {
  // Hover and press feedback
  snappy: { type: 'spring', duration: 0.35, bounce: 0.15 },
  // Panels and page turns
  soft: { type: 'spring', duration: 0.6, bounce: 0.12 },
  // Pointer driven tilt
  tilt: { stiffness: 140, damping: 18, mass: 0.6 },
  // Paper leaf on its spine
  page: { stiffness: 85, damping: 17, mass: 1 },
  // Book sliding to centre its pages
  shift: { stiffness: 120, damping: 22, mass: 1 },
} as const

/**
 * Easing curves, cubic bezier points
 * @type {Object}
 */

export const MOTION_EASINGS = {
  out: [0.23, 1, 0.32, 1],
  inOut: [0.77, 0, 0.175, 1],
} as const
