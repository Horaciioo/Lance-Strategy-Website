import type * as ThreeNamespace from 'three'

import { FLIGHT } from '@/declarations/flight'
import { Service } from '@/structures/Service'

type Three = typeof ThreeNamespace

const { trailSamples, trailWidth } = FLIGHT
const VERTICES_PER_SAMPLE = 2
const COLOR_CHANNELS = 4

// Fade from the plane to the oldest sample
const ALPHA_PEAK = 0.7
const ALPHA_POWER = 1.4
const WIDTH_GROWTH = 4.2
// Vapour condenses behind the engine
const CONDENSE_SHARE = 0.05
const VAPOUR_PX = { along: 256, across: 64 }

// Soft core, streaks along the length
const vapourTexture = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas')
  canvas.width = VAPOUR_PX.along
  canvas.height = VAPOUR_PX.across
  const context = canvas.getContext('2d')
  if (!context) return canvas
  const image = context.createImageData(VAPOUR_PX.along, VAPOUR_PX.across)
  const middle = VAPOUR_PX.across / 2

  for (let x = 0; x < VAPOUR_PX.along; x++) {
    for (let y = 0; y < VAPOUR_PX.across; y++) {
      const core = Math.exp(-(((y - middle) / (middle * 0.5)) ** 2))
      const streak = 0.78 + 0.22 * Math.sin(x * 0.11 + Math.sin(y * 0.4) * 2.4)
      const slot = (y * VAPOUR_PX.along + x) * 4
      image.data.set([255, 255, 255, Math.round(255 * core * streak)], slot)
    }
  }
  context.putImageData(image, 0, 0)

  return canvas
}

/**
 * Ribbon behind a wing tip
 * @typedef TrailRibbon
 * @property {Object} mesh - Scene object
 * @property {Function} update - Rewrite the ribbon from sampled centres
 */

export interface TrailRibbon {
  mesh: ThreeNamespace.Mesh
  update: (centres: ThreeNamespace.Vector3[], count: number) => void
}

class TrailServiceClass extends Service {
  /**
   * Camera facing contrail
   * @param {Three} three - Three namespace
   * @return {TrailRibbon} - Ribbon mesh and updater
   */

  create = (three: Three): TrailRibbon => {
    const vertexCount = trailSamples * VERTICES_PER_SAMPLE
    const positions = new Float32Array(vertexCount * 3)
    const colors = new Float32Array(vertexCount * COLOR_CHANNELS)
    const uvs = new Float32Array(vertexCount * 2)
    const indices: number[] = []
    for (let index = 0; index < trailSamples - 1; index++) {
      const base = index * VERTICES_PER_SAMPLE
      indices.push(base, base + 1, base + 2, base + 1, base + 3, base + 2)
    }

    // Age along, side across
    for (let index = 0; index < trailSamples; index++) {
      const age = index / (trailSamples - 1)
      uvs.set([age, 0, age, 1], index * VERTICES_PER_SAMPLE * 2)
    }

    const geometry = new three.BufferGeometry()
    geometry.setAttribute('position', new three.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new three.BufferAttribute(colors, COLOR_CHANNELS))
    geometry.setAttribute('uv', new three.BufferAttribute(uvs, 2))
    geometry.setIndex(indices)

    const mesh = new three.Mesh(
      geometry,
      new three.MeshBasicMaterial({
        map: new three.CanvasTexture(vapourTexture()),
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        side: three.DoubleSide,
      })
    )
    mesh.frustumCulled = false

    const side = new three.Vector3()
    const tangent = new three.Vector3()

    return {
      mesh,
      update: (centres, count) => {
        mesh.visible = count > 1
        if (count <= 1) return
        const last = count - 1

        // Newest sample first, widening and fading with age
        for (let index = 0; index < trailSamples; index++) {
          const sample = Math.min(index, last)
          const centre = centres[count - 1 - sample] ?? centres[0]
          const ahead = centres[count - 1 - Math.max(sample - 1, 0)] ?? centre
          const behind = centres[count - 1 - Math.min(sample + 1, last)] ?? centre
          if (!centre || !ahead || !behind) continue

          const age = index / (trailSamples - 1)
          const width = trailWidth * (0.55 + age * WIDTH_GROWTH)
          tangent.subVectors(ahead, behind).normalize()
          side.crossVectors(tangent, centre).normalize().multiplyScalar(width)
          const condensed = Math.min(1, age / CONDENSE_SHARE)
          const alpha = Math.pow(1 - age, ALPHA_POWER) * ALPHA_PEAK * condensed
          const slot = index * VERTICES_PER_SAMPLE

          positions.set([centre.x + side.x, centre.y + side.y, centre.z + side.z], slot * 3)
          positions.set([centre.x - side.x, centre.y - side.y, centre.z - side.z], (slot + 1) * 3)
          colors.set([1, 1, 1, alpha], slot * COLOR_CHANNELS)
          colors.set([1, 1, 1, alpha], (slot + 1) * COLOR_CHANNELS)
        }
        geometry.attributes.position!.needsUpdate = true
        geometry.attributes.color!.needsUpdate = true
      },
    }
  }
}

// Contrail ribbons
export const TrailService = new TrailServiceClass('trail')
