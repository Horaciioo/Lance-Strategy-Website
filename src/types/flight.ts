import type { Group, Sprite } from 'three'

/**
 * Camera space key point of the flight
 * @typedef FlightKeyframe
 * @property {number} x - Screen position, -1 left to 1 right
 * @property {number} y - Screen position, -1 bottom to 1 top
 * @property {number} depth - Distance from the camera
 */

export interface FlightKeyframe {
  x: number
  y: number
  depth: number
}

/**
 * Live flight scene
 * @typedef FlightHandle
 * @property {Function} frame - Scroll share, 0 to 1
 * @property {Function} resize - Viewport and take-off point
 * @property {Function} setActive - Start or pause the render loop
 * @property {Function} dispose - Release the GPU resources
 */

export interface FlightHandle {
  frame: (progress: number) => void
  resize: (size: FlightSize) => void
  // Render loop only while the stage shows
  setActive: (isActive: boolean) => void
  dispose: () => void
}

/**
 * Stage geometry
 * @typedef FlightSize
 * @property {number} width - Stage width, CSS pixels
 * @property {number} height - Stage height, CSS pixels
 * @property {number} originX - Take-off point left, CSS pixels
 * @property {number} originY - Take-off point top, CSS pixels
 */

export interface FlightSize {
  width: number
  height: number
  originX: number
  originY: number
}

/**
 * Built airliner
 * @typedef PlaneRig
 * @property {Object} group - Whole plane, nose along +X, right wing along +Z
 * @property {Object[]} lights - Navigation lights, as declared
 */

export interface PlaneRig {
  group: Group
  lights: Sprite[]
}

/**
 * Leg of the flight
 * @typedef FlightPhase
 * @property {string} leg - Outbound, or gone off screen
 * @property {number} share - Position along the leg, 0 to 1
 */

export interface FlightPhase {
  leg: 'out' | 'gap'
  share: number
}

/**
 * Flight scene request
 * @typedef FlightMount
 * @property {HTMLCanvasElement} canvas - Target canvas
 */

export interface FlightMount {
  canvas: HTMLCanvasElement
}

/**
 * Airfoil cross section
 * @typedef AirfoilStation
 * @property {number[]} lead - Leading edge point, plane space
 * @property {number} chord - Chord length
 * @property {number} thickness - Thickness, chord share
 */

export interface AirfoilStation {
  lead: readonly [number, number, number]
  chord: number
  thickness: number
}
