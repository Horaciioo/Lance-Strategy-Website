import type { GlobeInk, GlobePlace, GlobeRoute, GlobeRouteKind } from '@/types/globe'
import type { ColorName } from '@/types/theme'

/**
 * Planet texture maps, equirectangular
 * @type {Object}
 */

export const GLOBE_TEXTURES = {
  day: '/images/planet/day.webp',
  night: '/images/planet/night.webp',
  clouds: '/images/planet/clouds.webp',
  // Sea at 0.275, land above
  height: '/images/planet/relief.webp',
} as const

/**
 * Transport modes
 * @type {string[]}
 */

export const GLOBE_ROUTE_KINDS = ['air', 'road', 'sea'] as const

/**
 * Marked places
 * @type {Record<string, GlobePlace>}
 */

export const GLOBE_PLACES = {
  paris: { longitude: 2.35, latitude: 48.86, isLabelled: true, flag: 'france' },
  lyon: { longitude: 4.84, latitude: 45.76 },
  marseille: { longitude: 5.37, latitude: 43.3 },
  shanghai: { longitude: 121.47, latitude: 31.23, isLabelled: true, flag: 'china' },
  wuhan: { longitude: 114.31, latitude: 30.59 },
  shenzhen: { longitude: 114.06, latitude: 22.54 },
} as const satisfies Record<string, GlobePlace>

/**
 * National flag colours
 * @type {Object}
 */

export const GLOBE_FLAGS = {
  // Blue, white, red bands
  france: { colors: ['#0055a4', '#ffffff', '#ef4135'] },
  // Field, then stars
  china: { colors: ['#de2910', '#ffde00'] },
} as const

/**
 * Planted flag geometry
 * @type {Object}
 */

export const GLOBE_FLAG_GEOMETRY = {
  // Pole height, share of the radius
  poleShare: 0.17,
  poleMinPx: 28,
  poleMaxPx: 64,
  // Cloth size, share of the pole
  clothShare: 0.62,
  // Width over height
  aspect: 1.5,
  // Texture size, pixels
  textureWidth: 240,
  textureHeight: 160,
  strips: 16,
  // Ripple, share of the cloth height
  waveShare: 0.09,
  waveSpeed: 3.2,
  waveSpread: 0.6,
} as const

/**
 * Place identifier
 * @typedef {keyof typeof GLOBE_PLACES} GlobePlaceId
 */

export type GlobePlaceId = keyof typeof GLOBE_PLACES

/**
 * Connected routes
 * @type {GlobeRoute[]}
 */

export const GLOBE_ROUTES: GlobeRoute[] = [
  {
    id: 'sea',
    kind: 'sea',
    from: 'marseille',
    to: 'shanghai',
    // Suez, Malacca, Taiwan Strait
    via: [
      [6.5, 42],
      [9.8, 38],
      [11.8, 37.3],
      [19.5, 35],
      [26, 33.8],
      [32.3, 31.4],
      [32.6, 29.8],
      [34.2, 27.3],
      [38.5, 21],
      [42.6, 13.8],
      [43.4, 12.6],
      [48, 12.2],
      [54, 13],
      [65, 10],
      [77, 6.5],
      [80.6, 5.6],
      [88, 5.8],
      [95.3, 6.2],
      [98.5, 4.5],
      [100.8, 2.8],
      [103.5, 1.3],
      [104.8, 1.9],
      [107.5, 6],
      [110.5, 11],
      [112.3, 17.5],
      [113.9, 21.9],
      [117.5, 23.4],
      [119.8, 25.8],
      [122, 28.5],
      [122.3, 30.9],
    ],
  },
  {
    id: 'road',
    kind: 'road',
    from: 'lyon',
    to: 'wuhan',
    // Overland corridor through Kazakhstan
    via: [
      [8.7, 50.1],
      [13.4, 52.5],
      [21, 52.2],
      [27.6, 53.9],
      [37.6, 55.75],
      [50.1, 53.2],
      [63.6, 53.2],
      [71.4, 51.2],
      [80.3, 46.8],
      [82.6, 45.2],
      [87.6, 43.8],
      [94.7, 40.1],
      [103.8, 36.1],
      [108.9, 34.3],
      [112.3, 32],
    ],
  },
  { id: 'air', kind: 'air', from: 'paris', to: 'shanghai' },
]

/**
 * Theme colour per ink
 * @type {Record<string, ColorName>}
 */

export const GLOBE_INKS = {
  land: 'primary',
  route: 'foreground',
  grid: 'border-strong',
  ring: 'foreground-subtle',
  caption: 'foreground-muted',
  air: 'globe-air',
  sea: 'globe-sea',
  ground: 'globe-ground',
  label: 'globe-label',
  labelHalo: 'globe-label-halo',
  highlight: 'globe-highlight',
  shadow: 'globe-shadow',
} as const satisfies Record<string, ColorName>

/**
 * Planet rendering
 * @type {Object}
 */

export const GLOBE_PLANET = {
  // Atmosphere reach, in planet radii
  atmosphereReach: 1.2,
  // Cloud drift, texture turns per second
  cloudTurnsPerSecond: 0.004,
  // Terrain bump strength
  relief: 9,
  // Sun in view space, upper left
  sunView: [-0.62, 0.42, 0.66],
} as const

/**
 * Vehicle accent ink
 * @type {Record<GlobeRouteKind, GlobeInk>}
 */

export const GLOBE_VEHICLES = {
  air: 'air',
  sea: 'sea',
  road: 'ground',
} as const satisfies Record<GlobeRouteKind, GlobeInk>

/**
 * Vehicle paint, top view
 * @type {Object}
 */

export const GLOBE_VEHICLE_PAINT = {
  skin: '#f4f7fc',
  skinShade: '#aeb8cc',
  metal: '#6c7891',
  glass: '#0c1630',
  hull: '#1d2a44',
  hullShade: '#0d1526',
  deck: '#8a3b2f',
  cabin: '#f2f4f8',
  foam: '#ffffff',
  shadow: '#000000',
  portLight: '#ff4040',
  starboardLight: '#3ef08a',
  headlight: '#fff3c4',
  // Stacked container colours
  containers: ['#d9482b', '#2f6fd6', '#f2a516', '#1f9e6e', '#e9edf3', '#7c4bc9'],
} as const

/**
 * Framing and drawing geometry
 * @type {Object}
 */

export const GLOBE_GEOMETRY = {
  // Opening view, over France
  introView: { longitude: 2, latitude: 40 },
  // Resting view, France and China
  restView: { longitude: 61, latitude: 27 },
  // Globe radius per side
  radiusShare: 0.41,
  ringRadius: 1.14,
  ringFlatness: 0.3,
  ringTiltDegrees: 23.44,
  ringTickDegrees: 5,
  ringMajorEvery: 6,
  routeStepDegrees: 0.8,
  airLift: 0.16,
  swayDegrees: 18,
  dragDegreesPerPx: 0.3,
  dragLimitDegrees: 40,
  maxPixelRatio: 1.5,
  // Settled globe repaint cap
  idleFrameMs: 33,
  vehicleShare: 0.1,
  vehicleMinPx: 18,
  vehicleMaxPx: 44,
} as const

/**
 * Planet rising over the landing view
 * @type {Object}
 */

export const GLOBE_HORIZON = {
  // Landing radius, wider of both shares
  radiusOfWidth: 0.34,
  radiusOfHeight: 0.44,
  // Whole globe, share of the shorter side
  worldRadius: 0.36,
  // Horizon under the flight, wider of both shares
  skylineOfWidth: 0.95,
  skylineOfHeight: 1.15,
  // Disc top at landing, share of the height
  summitStart: 0.72,
  summitNarrow: 0.78,
  // Whole globe centre, then horizon top, share of the height
  worldCenter: 0.52,
  skylineTop: 0.8,
  // Take-off point, share of the radius above the centre
  takeOffLift: 0.55,
  // Focused city, degrees behind the summit
  tiltDegrees: 58,
  // Whole world framing, France to China
  worldView: { longitude: 62, latitude: 24 },
  // Slow spin over the whole scene
  spinDegrees: 70,
} as const

/**
 * Landing scene beats, shares of the scene timeline
 * @type {Object}
 */

export const INTRO_BEATS = {
  // Hill rises into the whole world
  riseEnd: 0.13,
  // Heading and cards leave
  leaveEnd: 0.08,
  // World caption window
  captionStart: 0.09,
  captionEnd: 0.29,
  // Plane flight, then the planet sinks
  flightStart: 0.29,
  flightEnd: 0.8,
  sinkEnd: 0.5,
  // Box filled, flight shares once the plane is gone
  boxFillStart: 0.6,
  boxFillSpan: 0.3,
  // Next section slides over
  sheetStart: 0.9,
  // Scroll smoothing, share per frame
  follow: 0.16,
} as const

/**
 * Landing playback: the first scroll gesture plays the scene up to the filled box, an upward one at the top plays it back
 * @type {Object}
 */

export const INTRO_PLAY = {
  // Landing title held before the take-off, unless a scroll gesture comes first
  holdMs: 7000,
  // Landing to filled box
  durationMs: 7000,
} as const

/**
 * Choreography durations
 * @type {Object}
 */

export const GLOBE_TIMINGS = {
  introMs: 3200,
  revealMs: 2600,
  routeDelayMs: 1500,
  routeMs: 2600,
  swayMs: 26000,
  travelMs: 9000,
  returnMs: 1600,
  ringTurnMs: 140000,
  dashMs: 1400,
  turnMs: 2400,
} as const
