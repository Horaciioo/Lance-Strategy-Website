import type { GLOBE_FLAGS, GLOBE_INKS, GLOBE_ROUTE_KINDS } from '@/declarations/globe'

/**
 * Unit sphere vector
 * @typedef {[number, number, number]} Vector
 */

export type Vector = [number, number, number]

/**
 * Geographic position
 * @typedef GlobeCoordinate
 * @property {number} longitude - East degrees
 * @property {number} latitude - North degrees
 */

export interface GlobeCoordinate {
  longitude: number
  latitude: number
}

/**
 * Running camera turn
 * @typedef GlobeFocus
 * @property {GlobeCoordinate} from - Start view
 * @property {GlobeCoordinate} to - End view
 * @property {number} startedAt - Clock start
 * @property {number} durationMs - Turn length
 */

export interface GlobeFocus {
  from: GlobeCoordinate
  to: GlobeCoordinate
  startedAt: number
  durationMs: number
}

/**
 * Sphere placement in CSS pixels
 * @typedef GlobeFraming
 * @property {number} centerX - Centre left
 * @property {number} centerY - Centre top
 * @property {number} radius - Sphere radius
 * @property {number} [turnDegrees] - Extra eastward turn
 * @property {Object} [towards] - Pull towards a view
 */

export interface GlobeFraming {
  centerX: number
  centerY: number
  radius: number
  // Extra eastward turn
  turnDegrees?: number
  // Pull towards a view, 0 to 1
  towards?: { view: GlobeCoordinate; share: number }
}

/**
 * Live globe controls
 * @typedef GlobeHandle
 * @property {Function} focus - Turn to a view
 * @property {Function} frame - Place the sphere
 * @property {Function} stop - Teardown
 */

export interface GlobeHandle {
  focus: (view: GlobeCoordinate) => void
  frame: (framing: GlobeFraming) => void
  stop: () => void
}

/**
 * Marked place
 * @typedef GlobePlace
 * @property {boolean} [isLabelled] - Label drawn
 * @property {GlobeFlagId} [flag] - Planted flag
 */

export interface GlobePlace extends GlobeCoordinate {
  isLabelled?: boolean
  flag?: GlobeFlagId
}

/**
 * Flag identifier
 * @typedef {keyof typeof GLOBE_FLAGS} GlobeFlagId
 */

export type GlobeFlagId = keyof typeof GLOBE_FLAGS

/**
 * Route kind
 * @typedef {(typeof GLOBE_ROUTE_KINDS)[number]} GlobeRouteKind
 */

export type GlobeRouteKind = (typeof GLOBE_ROUTE_KINDS)[number]

/**
 * Declared route
 * @typedef GlobeRoute
 * @property {GlobeRouteKind} kind - Transport mode
 * @property {string} from - Origin place
 * @property {string} to - Destination place
 * @property {Array<[number, number]>} [via] - Waypoints, longitude first
 */

export interface GlobeRoute {
  id: string
  kind: GlobeRouteKind
  from: string
  to: string
  via?: [number, number][]
}

/**
 * Translated place label
 * @typedef GlobeLabel
 * @property {string} name - Local name
 * @property {string} counterpart - Other script
 */

export interface GlobeLabel {
  name: string
  counterpart: string
}

/**
 * Projection camera
 * @typedef GlobeCamera
 */

export interface GlobeCamera {
  sinLongitude: number
  cosLongitude: number
  sinLatitude: number
  cosLatitude: number
}

/**
 * Projected point
 * @typedef GlobePoint
 * @property {number} x - Right, radius units
 * @property {number} y - Up, radius units
 * @property {number} depth - Toward viewer
 */

export interface GlobePoint {
  x: number
  y: number
  depth: number
}

/**
 * Ink role
 * @typedef {keyof typeof GLOBE_INKS} GlobeInk
 */

export type GlobeInk = keyof typeof GLOBE_INKS

/**
 * Resolved RGB channels
 * @typedef {Record<GlobeInk, string>} GlobePalette
 */

export type GlobePalette = Record<GlobeInk, string>

/**
 * Route ready to draw
 * @typedef PreparedRoute
 */

export interface PreparedRoute {
  id: string
  kind: GlobeRouteKind
  points: Vector[]
  // Cumulative chord lengths
  lengths: number[]
}

/**
 * Place ready to draw
 * @typedef PreparedPlace
 */

export interface PreparedPlace {
  id: string
  vector: Vector
  label?: GlobeLabel
  flag?: GlobeFlagId
}

/**
 * One frame state
 * @typedef GlobeFrame
 */

export interface GlobeFrame {
  context: CanvasRenderingContext2D
  width: number
  height: number
  centerX: number
  centerY: number
  radius: number
  // Orbit ring drawn
  hasRing: boolean
  // Lit planet drawn by the GPU underneath
  hasPlanet: boolean
  camera: GlobeCamera
  palette: GlobePalette
  fontFamily: string
  routes: PreparedRoute[]
  places: PreparedPlace[]
  origin: Vector
  // Sphere opacity
  presence: number
  // Drawn route share
  routeProgress: number
  // Travelling marker phase
  travel: number | null
  ringAngle: number
  dashOffset: number
  // Animation clock
  seconds: number
}

/**
 * One planet frame
 * @typedef PlanetFrame
 * @property {number} width - Canvas width, CSS pixels
 * @property {number} height - Canvas height, CSS pixels
 * @property {number} pixelRatio - Backing store ratio
 * @property {number} centerX - Sphere centre left
 * @property {number} centerY - Sphere centre top
 * @property {number} radius - Sphere radius
 * @property {GlobeCamera} camera - Orthographic camera
 * @property {number} cloudDrift - Cloud offset, texture turns
 * @property {number} time - Seconds since mount
 * @property {number} presence - Opacity
 */

export interface PlanetFrame {
  width: number
  height: number
  pixelRatio: number
  centerX: number
  centerY: number
  radius: number
  camera: GlobeCamera
  cloudDrift: number
  // Seconds since mount
  time: number
  presence: number
}

/**
 * Live GPU planet
 * @typedef PlanetHandle
 * @property {Function} draw - Paint a frame
 * @property {Function} dispose - Release the GPU resources
 */

export interface PlanetHandle {
  draw: (frame: PlanetFrame) => void
  dispose: () => void
}
