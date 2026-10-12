import type { ShapeAnchor, ShapeDeclaration, ShapeVertex } from '@/types/shape'

// Samples per rounded corner
const CORNER_STEPS = 8

type Pair = [number, number]

type Box = ShapeDeclaration['box']

const expressionOf = ({ share, rem }: ShapeAnchor): string => `calc(${share * 100}% + ${rem}rem)`

// Signed gap on the nominal box
const gapOf = (from: ShapeAnchor, to: ShapeAnchor, span: number): number =>
  (to.share - from.share) * span + to.rem - from.rem

const directionOf = (from: ShapeVertex, to: ShapeVertex, box: Box): Pair => {
  const x = gapOf(from[0], to[0], box.width)
  const y = gapOf(from[1], to[1], box.height)
  const length = Math.hypot(x, y)

  return [x / length, y / length]
}

// Quadratic curve through the corner
const cornerOf = (vertex: ShapeVertex, before: Pair, after: Pair, radius: number): string[] => {
  const [x, y, reach = radius] = vertex
  const point = (t: number): string => {
    const offset = (axis: 0 | 1): number =>
      ((1 - t) ** 2 * -before[axis] + t ** 2 * after[axis]) * reach

    return `${expressionOf({ share: x.share, rem: x.rem + offset(0) })} ${expressionOf({ share: y.share, rem: y.rem + offset(1) })}`
  }

  return Array.from({ length: CORNER_STEPS + 1 }, (_, step) => point(step / CORNER_STEPS))
}

/**
 * Rounded clip polygon
 * @param {ShapeVertex[]} vertices - Clockwise outline
 * @param {number} radius - Default corner reach
 * @param {Box} box - Nominal size in rem
 * @return {string} - CSS polygon
 */

export const roundedPolygon = (vertices: ShapeVertex[], radius: number, box: Box): string => {
  // One rounded corner per vertex
  const points = vertices.flatMap((vertex, index) => {
    const previous = vertices[(index - 1 + vertices.length) % vertices.length] as ShapeVertex
    const next = vertices[(index + 1) % vertices.length] as ShapeVertex

    return cornerOf(
      vertex,
      directionOf(previous, vertex, box),
      directionOf(vertex, next, box),
      radius
    )
  })

  return `polygon(${points.join(', ')})`
}

/**
 * Panel CSS variables
 * @param {ShapeDeclaration} shape - Cut panel
 * @return {Record<string, string>} - Clip and notch variables
 */

export const shapeVariables = ({
  outline,
  reach,
  box,
  notches,
}: ShapeDeclaration): Record<string, string> => ({
  '--shape-clip': roundedPolygon(outline, reach, box),
  ...Object.fromEntries(
    Object.entries(notches).map(([name, rem]) => [`--notch-${name}`, `${rem}rem`])
  ),
})
