import type * as ThreeNamespace from 'three'

import { FLIGHT_BANNER } from '@/declarations/flight'
import { Service } from '@/structures/Service'

type Three = typeof ThreeNamespace

const { length, height, segments, anchor, rope, wave, droop, notch, texture, colors } =
  FLIGHT_BANNER
const [anchorX, anchorY, anchorZ] = anchor
const START_X = anchorX - rope
const FONT = '"Archivo", "Helvetica Neue", Helvetica, Arial, sans-serif'
const MIN_FONT_PX = 40
const STITCH_PX = 10
const STITCH_INSET = 30
const ROPE_SPREAD = 0.85

/**
 * Towed banner
 * @typedef Banner
 * @property {Object} group - Cloth and ropes, plane space
 * @property {Function} update - Flutter at a time, seconds
 * @property {Function} tailAt - Free end of the cloth, plane space
 */

export interface Banner {
  group: ThreeNamespace.Group
  update: (seconds: number) => void
  tailAt: (seconds: number, target: ThreeNamespace.Vector3) => ThreeNamespace.Vector3
}

class BannerServiceClass extends Service {
  /**
   * Build the cloth with its text and ropes
   * @param {Three} three - Three namespace
   * @param {string} text - Words on the cloth
   * @return {Banner} - Banner group and animators
   */

  build = (three: Three, text: string): Banner => {
    const geometry = new three.PlaneGeometry(length, height, segments[0], segments[1])
    // Cloth runs back from the rope, last word next to the plane
    geometry.translate(START_X - length / 2, 0, anchorZ)
    const rest = Float32Array.from(geometry.getAttribute('position').array)
    const position = geometry.getAttribute('position')

    const map = new three.CanvasTexture(this.texture(text))
    map.colorSpace = three.SRGBColorSpace
    map.anisotropy = 8
    const cloth = new three.Mesh(
      geometry,
      new three.MeshStandardMaterial({
        map,
        roughness: 0.85,
        metalness: 0,
        side: three.DoubleSide,
        // Swallowtail cut out of the cloth
        alphaTest: 0.5,
      })
    )

    // Two ropes from the plane tail to the cloth edge
    const ropes = new three.LineSegments(
      new three.BufferGeometry().setFromPoints([
        new three.Vector3(anchorX, anchorY, anchorZ),
        new three.Vector3(START_X, (height / 2) * ROPE_SPREAD, anchorZ),
        new three.Vector3(anchorX, anchorY, anchorZ),
        new three.Vector3(START_X, (-height / 2) * ROPE_SPREAD, anchorZ),
      ]),
      new three.LineBasicMaterial({ color: colors.rope })
    )

    const group = new three.Group()
    group.add(cloth, ropes)

    // Flutter grows from the rope to the free end
    const offsetAt = (reach: number, seconds: number) => {
      const grow = Math.pow(reach, 1.2)
      const phase = wave.frequency * reach * length - wave.speed * seconds

      return {
        side: Math.sin(phase) * wave.amplitude * grow,
        lift: Math.sin(phase * 0.8 + 1) * wave.amplitude * 0.28 * grow - droop * reach * reach,
      }
    }

    return {
      group,
      update: (seconds) => {
        for (let index = 0; index < position.count; index++) {
          const reach = (START_X - (rest[index * 3] ?? START_X)) / length
          const { side, lift } = offsetAt(reach, seconds)
          position.setY(index, (rest[index * 3 + 1] ?? 0) + lift)
          position.setZ(index, anchorZ + side)
        }
        position.needsUpdate = true
        geometry.computeVertexNormals()
      },
      tailAt: (seconds, target) => {
        const { side, lift } = offsetAt(1, seconds)

        return target.set(START_X - length, lift, anchorZ + side)
      },
    }
  }

  // Paper cloth, stitched edges, swallowtail free end
  private texture = (text: string): HTMLCanvasElement => {
    const canvas = document.createElement('canvas')
    canvas.width = texture.width
    canvas.height = texture.height
    const context = canvas.getContext('2d')
    if (!context) return canvas
    const { width, height: tall } = canvas
    // Free end on the left, the plane pulls rightwards
    const cut = width * notch

    // Cloth with its notch
    context.fillStyle = colors.cloth
    context.beginPath()
    context.moveTo(0, 0)
    context.lineTo(width, 0)
    context.lineTo(width, tall)
    context.lineTo(0, tall)
    context.lineTo(cut, tall / 2)
    context.closePath()
    context.fill()

    // Stitched hems
    context.strokeStyle = colors.border
    context.lineWidth = 8
    context.setLineDash([STITCH_PX * 3, STITCH_PX * 2])
    for (const y of [STITCH_INSET, tall - STITCH_INSET]) {
      context.beginPath()
      context.moveTo(STITCH_INSET, y)
      context.lineTo(width - STITCH_INSET * 2, y)
      context.stroke()
    }

    // Wide capitals fitted to the width
    let size = 150
    const fontOf = (px: number) => `800 ${px}px ${FONT}`
    context.font = fontOf(size)
    context.letterSpacing = '12px'
    const label = text.toUpperCase()
    const room = width - cut - texture.padding * 2
    size = Math.max(
      MIN_FONT_PX,
      Math.floor(size * Math.min(1, room / context.measureText(label).width))
    )
    context.font = fontOf(size)
    context.fillStyle = colors.ink
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText(label, (width + cut) / 2, tall / 2 + 4)

    return canvas
  }
}

// Towed cloth
export const BannerService = new BannerServiceClass('banner')
