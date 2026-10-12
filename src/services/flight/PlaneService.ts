import type * as ThreeNamespace from 'three'

import { FLIGHT_COLORS, FUSELAGE_PROFILE, PLANE_LIGHTS } from '@/declarations/flight'
import { AirframeService } from '@/services/flight/AirframeService'
import { EngineService } from '@/services/flight/EngineService'
import { LiveryService } from '@/services/flight/LiveryService'
import { Service } from '@/structures/Service'
import type { PlaneRig } from '@/types/flight'

type Three = typeof ThreeNamespace

const FUSELAGE_SEGMENTS = 72
const PROFILE_SAMPLES = 120
const LIGHT_GLOW_PX = 64
const FIN_TEXTURE_PX = 512
// Tail cone rises from here, and by this much
const UPSWEEP_FROM = -0.85
const UPSWEEP_LIFT = 0.17
const UPSWEEP_SPAN = 1.35
const FUSELAGE_TAIL = FUSELAGE_PROFILE[0]?.[1] ?? 0
const FUSELAGE_LENGTH = (FUSELAGE_PROFILE.at(-1)?.[1] ?? 1) - FUSELAGE_TAIL

// Glow sprite texture
const glowTexture = (color: string): HTMLCanvasElement => {
  const canvas = document.createElement('canvas')
  canvas.width = LIGHT_GLOW_PX
  canvas.height = LIGHT_GLOW_PX
  const context = canvas.getContext('2d')
  const middle = LIGHT_GLOW_PX / 2
  const gradient = context?.createRadialGradient(middle, middle, 0, middle, middle, middle)
  gradient?.addColorStop(0, FLIGHT_COLORS.strobe)
  gradient?.addColorStop(0.18, color)
  gradient?.addColorStop(1, 'rgba(0,0,0,0)')
  if (context && gradient) {
    context.fillStyle = gradient
    context.fillRect(0, 0, LIGHT_GLOW_PX, LIGHT_GLOW_PX)
  }

  return canvas
}

// Dark fin, an accent sweep across
const finTexture = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas')
  canvas.width = FIN_TEXTURE_PX
  canvas.height = FIN_TEXTURE_PX
  const context = canvas.getContext('2d')
  if (!context) return canvas

  context.fillStyle = FLIGHT_COLORS.ink
  context.fillRect(0, 0, FIN_TEXTURE_PX, FIN_TEXTURE_PX)
  context.fillStyle = FLIGHT_COLORS.accent
  context.beginPath()
  context.moveTo(0, FIN_TEXTURE_PX * 0.3)
  context.lineTo(FIN_TEXTURE_PX, FIN_TEXTURE_PX * 0.58)
  context.lineTo(FIN_TEXTURE_PX, FIN_TEXTURE_PX * 0.7)
  context.lineTo(0, FIN_TEXTURE_PX * 0.4)
  context.fill()

  return canvas
}

class PlaneServiceClass extends Service {
  /**
   * Build the airliner
   * @param {Three} three - Three namespace, loaded on demand
   * @return {PlaneRig} - Model and lights
   */

  build = (three: Three): PlaneRig => {
    const group = new three.Group()
    const wing = new three.MeshPhysicalMaterial({
      color: FLIGHT_COLORS.wing,
      roughness: 0.36,
      metalness: 0.55,
      clearcoat: 0.2,
      side: three.DoubleSide,
    })
    const finMap = new three.CanvasTexture(finTexture())
    finMap.colorSpace = three.SRGBColorSpace
    const fin = new three.MeshPhysicalMaterial({
      map: finMap,
      roughness: 0.34,
      metalness: 0.05,
      clearcoat: 0.6,
      clearcoatRoughness: 0.2,
      side: three.DoubleSide,
    })

    group.add(
      this.fuselage(three),
      this.fairing(three, wing),
      ...AirframeService.build(three, { wing, fin }),
      ...EngineService.build(three)
    )

    const lights = PLANE_LIGHTS.map(({ color, at, size }) => {
      const sprite = this.light(three, color)
      sprite.position.fromArray(at)
      sprite.scale.setScalar(size)

      return sprite
    })
    group.add(...lights)

    return { group, lights }
  }

  private fuselage = (three: Three): ThreeNamespace.Mesh => {
    const profile = new three.SplineCurve(
      FUSELAGE_PROFILE.map(([radius, axial]) => new three.Vector2(radius, axial))
    ).getPoints(PROFILE_SAMPLES)
    // Seam on the roof, sides centred on the livery
    const geometry = new three.LatheGeometry(profile, FUSELAGE_SEGMENTS, (Math.PI * 3) / 2)
    geometry.rotateZ(-Math.PI / 2)

    // Livery along the true length, upswept tail cone
    const position = geometry.getAttribute('position')
    const uv = geometry.getAttribute('uv')
    for (let index = 0; index < position.count; index++) {
      const axial = position.getX(index)
      const behind = (UPSWEEP_FROM - axial) / UPSWEEP_SPAN
      uv.setY(index, (axial - FUSELAGE_TAIL) / FUSELAGE_LENGTH)
      if (behind > 0) position.setY(index, position.getY(index) + UPSWEEP_LIFT * behind ** 1.6)
    }
    geometry.computeVertexNormals()

    const livery = LiveryService.fuselage()
    const [map, emissiveMap] = [livery.skin, livery.glow].map((canvas) => {
      const texture = new three.CanvasTexture(canvas)
      texture.colorSpace = three.SRGBColorSpace
      texture.anisotropy = 8

      return texture
    })

    return new three.Mesh(
      geometry,
      new three.MeshPhysicalMaterial({
        map,
        emissiveMap,
        emissive: FLIGHT_COLORS.strobe,
        emissiveIntensity: 1.2,
        roughness: 0.32,
        metalness: 0.05,
        clearcoat: 0.6,
        clearcoatRoughness: 0.18,
      })
    )
  }

  // Belly fairing under the wing root
  private fairing = (three: Three, material: ThreeNamespace.Material): ThreeNamespace.Mesh => {
    const mesh = new three.Mesh(new three.SphereGeometry(1, 32, 16), material)
    mesh.scale.set(0.9, 0.12, 0.25)
    mesh.position.set(-0.05, -0.15, 0)

    return mesh
  }

  // Additive glow, pulsed by the scene
  private light = (three: Three, color: string): ThreeNamespace.Sprite =>
    new three.Sprite(
      new three.SpriteMaterial({
        map: new three.CanvasTexture(glowTexture(color)),
        blending: three.AdditiveBlending,
        depthWrite: false,
        transparent: true,
      })
    )
}

// Procedural airliner
export const PlaneService = new PlaneServiceClass('plane')
