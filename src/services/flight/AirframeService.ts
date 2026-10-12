import type * as ThreeNamespace from 'three'

import { AIRFRAME } from '@/declarations/flight'
import { Service } from '@/structures/Service'
import type { AirfoilStation } from '@/types/flight'

type Three = typeof ThreeNamespace
type Mesh = ThreeNamespace.Mesh
type Material = ThreeNamespace.Material

// Points per airfoil side
const CHORD_STEPS = 14
// Stations between declared ones
const SPAN_STEPS = 5

// Symmetric NACA thickness, chord share
const thicknessAt = (along: number): number =>
  5 *
  (0.2969 * Math.sqrt(along) -
    0.126 * along -
    0.3516 * along ** 2 +
    0.2843 * along ** 3 -
    0.1036 * along ** 4)

// Cosine spacing, dense at both edges
const chordShares = Array.from(
  { length: CHORD_STEPS + 1 },
  (_, step) => (1 - Math.cos((Math.PI * step) / CHORD_STEPS)) / 2
)

// Upper surface forward, lower back
const RING = [
  ...chordShares.map((along) => ({ along, side: 1 })),
  ...chordShares
    .slice(1, -1)
    .reverse()
    .map((along) => ({ along, side: -1 })),
]

const blendStations = (from: AirfoilStation, to: AirfoilStation, share: number) => ({
  lead: from.lead.map((value, axis) => value + ((to.lead[axis] ?? 0) - value) * share) as [
    number,
    number,
    number,
  ],
  chord: from.chord + (to.chord - from.chord) * share,
  thickness: from.thickness + (to.thickness - from.thickness) * share,
})

// Declared stations, refined
const refine = (stations: readonly AirfoilStation[]) =>
  stations.flatMap((station, index) => {
    const next = stations[index + 1]
    if (!next) return [{ ...station }]

    return Array.from({ length: SPAN_STEPS }, (_, step) =>
      blendStations(station, next, step / SPAN_STEPS)
    )
  })

class AirframeServiceClass extends Service {
  /**
   * Lofted airfoil surface
   * @param {Object} input - Surface request
   * @param {Three} input.three - Three namespace
   * @param {AirfoilStation[]} input.stations - Root to tip
   * @param {string} input.thicknessAxis - Normal to the chord
   * @param {Material} input.material - Skin
   * @return {Mesh} - Closed surface
   */

  loft = ({
    three,
    stations,
    thicknessAxis,
    material,
  }: {
    three: Three
    stations: readonly AirfoilStation[]
    thicknessAxis: 'y' | 'z'
    material: Material
  }): Mesh => {
    const sections = refine(stations)
    const positions: number[] = []
    const uvs: number[] = []
    const indices: number[] = []
    const thicknessIndex = thicknessAxis === 'y' ? 1 : 2

    // Ring of points per section
    sections.forEach((section, row) => {
      for (const { along, side } of RING) {
        const point = [...section.lead]
        point[0] = (point[0] ?? 0) - along * section.chord
        point[thicknessIndex] =
          (point[thicknessIndex] ?? 0) +
          side * thicknessAt(along) * section.thickness * section.chord * 0.5
        positions.push(...point)
        uvs.push(along, row / (sections.length - 1))
      }
    })

    // Quads between rings
    const width = RING.length
    for (let row = 0; row < sections.length - 1; row++) {
      for (let column = 0; column < width; column++) {
        const a = row * width + column
        const b = row * width + ((column + 1) % width)
        indices.push(a, a + width, b, b, a + width, b + width)
      }
    }

    // Tip cap, fanned from the mid chord
    const tip = sections.at(-1)
    if (tip) {
      const centre = positions.length / 3
      positions.push(tip.lead[0] - tip.chord * 0.45, tip.lead[1], tip.lead[2])
      uvs.push(0.45, 1)
      const first = (sections.length - 1) * width
      for (let column = 0; column < width; column++)
        indices.push(first + column, centre, first + ((column + 1) % width))
    }

    const geometry = new three.BufferGeometry()
    geometry.setAttribute('position', new three.Float32BufferAttribute(positions, 3))
    geometry.setAttribute('uv', new three.Float32BufferAttribute(uvs, 2))
    geometry.setIndex(indices)
    geometry.computeVertexNormals()

    return new three.Mesh(geometry, material)
  }

  /**
   * Wings, winglets and tail
   * @param {Three} three - Three namespace
   * @param {Object} skins - Surface materials
   * @param {Material} skins.wing - Wing skin
   * @param {Material} skins.fin - Fin skin
   * @return {Mesh[]} - Surfaces
   */

  build = (three: Three, skins: { wing: Material; fin: Material }): Mesh[] => {
    const mirrored = (mesh: Mesh): Mesh[] => {
      const twin = mesh.clone()
      twin.scale.z = -1

      return [mesh, twin]
    }
    const loft = (stations: readonly AirfoilStation[], axis: 'y' | 'z', material: Material) =>
      this.loft({ three, stations, thicknessAxis: axis, material })

    return [
      ...mirrored(loft(AIRFRAME.wing, 'y', skins.wing)),
      ...mirrored(loft(AIRFRAME.winglet, 'z', skins.fin)),
      ...mirrored(loft(AIRFRAME.stabiliser, 'y', skins.wing)),
      loft(AIRFRAME.fin, 'z', skins.fin),
    ]
  }
}

// Lofted flying surfaces
export const AirframeService = new AirframeServiceClass('airframe')
