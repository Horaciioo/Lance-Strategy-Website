import type { AirfoilStation, FlightKeyframe } from '@/types/flight'

/**
 * Flight scene settings
 * @type {Object}
 */

export const FLIGHT = {
  fieldOfView: 35,
  near: 1,
  far: 400,
  maxPixelRatio: 1.75,
  // Flight share where the plane is off screen left
  outEnd: 0.6,
  // Share of the outbound flight the contrails keep
  trailSpan: 0.4,
  trailSamples: 64,
  trailWidth: 0.05,
  // Engine offsets from the plane axis, sideways then down
  trailOffsets: [-0.78, 0.78],
  trailDrop: -0.27,
  // Sample step for headings, share of one flight leg
  headingStep: 0.006,
  // Roll per radian of heading change per leg share
  rollGain: 0.025,
  rollLimit: 0.6,
} as const

/**
 * Outbound leg in camera space, evenly spaced, from the planet to off screen left.
 * The first point is replaced by the take-off point on the planet.
 * @type {FlightKeyframe[]}
 */

export const FLIGHT_PATH_OUT: FlightKeyframe[] = [
  { x: 0, y: 0, depth: 150 },
  { x: 0.02, y: 0.1, depth: 118 },
  { x: 0.42, y: 0.16, depth: 82 },
  { x: 0.5, y: 0.1, depth: 54 },
  { x: 0.36, y: 0.02, depth: 34 },
  { x: 0.1, y: -0.08, depth: 20 },
  { x: -0.5, y: -0.1, depth: 12.5 },
  { x: -1.5, y: 0.05, depth: 11 },
  { x: -2.6, y: 0.2, depth: 12 },
]

/**
 * Plane colours
 * @type {Object}
 */

export const FLIGHT_COLORS = {
  body: '#f4f5f7',
  belly: '#aab2bf',
  accent: '#f2a33a',
  ink: '#10213f',
  wing: '#c4cad4',
  metal: '#8793ad',
  glass: '#0b1226',
  portLight: '#ff3b3b',
  starboardLight: '#38e07b',
  strobe: '#ffffff',
  beacon: '#ff2a1a',
  cabinLight: '#ffc77a',
  unlit: '#000000',
  seam: 'rgba(16, 33, 63, 0.05)',
  seamStrong: 'rgba(16, 33, 63, 0.22)',
} as const

/**
 * Navigation lights, plane space
 * @type {Object[]}
 */

export const PLANE_LIGHTS = [
  { color: FLIGHT_COLORS.portLight, at: [-0.5, 0.03, -2.0], size: 0.14, pulse: 'steady' },
  { color: FLIGHT_COLORS.starboardLight, at: [-0.5, 0.03, 2.0], size: 0.14, pulse: 'steady' },
  { color: FLIGHT_COLORS.strobe, at: [-0.6, 0.04, -2.0], size: 0.32, pulse: 'strobe' },
  { color: FLIGHT_COLORS.strobe, at: [-0.6, 0.04, 2.0], size: 0.32, pulse: 'strobe' },
  { color: FLIGHT_COLORS.strobe, at: [-2.22, 0.16, 0], size: 0.22, pulse: 'strobe' },
  { color: FLIGHT_COLORS.beacon, at: [0.1, 0.25, 0], size: 0.16, pulse: 'beacon' },
  { color: FLIGHT_COLORS.beacon, at: [-0.4, -0.25, 0], size: 0.16, pulse: 'beacon' },
] as const satisfies ReadonlyArray<{
  color: string
  at: readonly [number, number, number]
  size: number
  pulse: 'steady' | 'strobe' | 'beacon'
}>

/**
 * Lighting rig, sun matching the planet
 * @type {Object}
 */

export const FLIGHT_LIGHTS = {
  sun: { color: '#fff1d6', intensity: 3.4, position: [-6.2, 4.2, 6.6] },
  // Blue bounce from the planet below
  earth: { color: '#a9bce6', intensity: 0.6, position: [1.5, -7, -2] },
  rim: { color: '#9fc2ff', intensity: 1.8, position: [6, 3, -7] },
  sky: { color: '#b9cdf2', ground: '#262b38', intensity: 0.45 },
  // Reflected sky dome, zenith to nadir
  dome: { zenith: '#050b22', horizon: '#6e7d9c', nadir: '#1c2130', sun: [9, 8, 7] },
  environment: 0.75,
  exposure: 1.05,
} as const

/**
 * Fuselage profile, radius against axial position, tail to nose
 * @type {Array<[number, number]>}
 */

export const FUSELAGE_PROFILE: Array<[number, number]> = [
  [0, -2.2],
  [0.035, -2.15],
  [0.085, -1.95],
  [0.145, -1.6],
  [0.2, -1.2],
  [0.229, -0.8],
  [0.235, -0.4],
  [0.235, 1.2],
  [0.232, 1.5],
  [0.222, 1.72],
  [0.202, 1.88],
  [0.17, 2.01],
  [0.125, 2.11],
  [0.07, 2.175],
  [0, 2.2],
]

/**
 * Flying surfaces, root to tip
 * @type {Record<string, AirfoilStation[]>}
 */

export const AIRFRAME = {
  // Swept wing with a trailing edge kink and dihedral
  wing: [
    { lead: [0.52, -0.13, 0.12], chord: 1.12, thickness: 0.13 },
    { lead: [0.2, -0.1, 0.78], chord: 0.66, thickness: 0.11 },
    { lead: [-0.5, 0.02, 2.0], chord: 0.22, thickness: 0.09 },
  ],
  winglet: [
    { lead: [-0.49, 0.015, 1.99], chord: 0.22, thickness: 0.09 },
    { lead: [-0.55, 0.08, 2.03], chord: 0.18, thickness: 0.09 },
    { lead: [-0.74, 0.38, 2.06], chord: 0.08, thickness: 0.09 },
  ],
  stabiliser: [
    { lead: [-1.48, 0.1, 0.05], chord: 0.52, thickness: 0.1 },
    { lead: [-1.95, 0.16, 0.86], chord: 0.2, thickness: 0.09 },
  ],
  fin: [
    { lead: [-1.08, 0.14, 0], chord: 0.98, thickness: 0.11 },
    { lead: [-1.92, 1.02, 0], chord: 0.36, thickness: 0.09 },
  ],
} as const satisfies Record<string, readonly AirfoilStation[]>

/**
 * Twin engines, plane space
 * @type {Object}
 */

export const ENGINE = {
  // Nacelle centre per side
  centre: [0.42, -0.3, 0.74],
  // Outer cowl, radius against axial position
  cowl: [
    [0.118, 0.2],
    [0.124, 0.33],
    [0.138, 0.37],
    [0.155, 0.35],
    [0.164, 0.26],
    [0.162, 0.02],
    [0.146, -0.2],
    [0.118, -0.3],
  ],
  // Exhaust plug
  plug: [
    [0.094, -0.28],
    [0.082, -0.38],
    [0.042, -0.46],
    [0, -0.5],
  ],
  fanAt: 0.2,
  fanRadius: 0.12,
  blades: 22,
} as const
