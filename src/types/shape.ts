/**
 * Edge anchor
 * @typedef ShapeAnchor
 * @property {number} share - Box share, 0 to 1
 * @property {number} rem - Offset in rem
 */

export interface ShapeAnchor {
  share: number
  rem: number
}

/**
 * Outline vertex
 * @typedef {[ShapeAnchor, ShapeAnchor, number?]} ShapeVertex
 */

export type ShapeVertex = [x: ShapeAnchor, y: ShapeAnchor, reach?: number]

/**
 * Cut panel declaration
 * @typedef ShapeDeclaration
 * @property {ShapeVertex[]} outline - Clockwise vertices
 * @property {number} reach - Default corner reach
 * @property {Object} box - Nominal size in rem
 * @property {Record<string, number>} notches - Exposed measures
 */

export interface ShapeDeclaration {
  outline: ShapeVertex[]
  reach: number
  // Nominal size, slants only
  box: { width: number; height: number }
  notches: Record<string, number>
}
