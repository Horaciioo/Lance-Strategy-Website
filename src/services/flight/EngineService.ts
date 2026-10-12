import type * as ThreeNamespace from 'three'

import { ENGINE, FLIGHT_COLORS } from '@/declarations/flight'
import { Service } from '@/structures/Service'

type Three = typeof ThreeNamespace
type Group = ThreeNamespace.Group

const LATHE_SEGMENTS = 40
const FAN_TEXTURE_PX = 256

// Lathe around the plane axis
const latheOf = (three: Three, profile: ReadonlyArray<readonly [number, number]>) => {
  const geometry = new three.LatheGeometry(
    profile.map(([radius, axial]) => new three.Vector2(radius, axial)),
    LATHE_SEGMENTS
  )
  geometry.rotateZ(-Math.PI / 2)

  return geometry
}

// Blades seen through the intake
const fanTexture = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas')
  canvas.width = FAN_TEXTURE_PX
  canvas.height = FAN_TEXTURE_PX
  const context = canvas.getContext('2d')
  if (!context) return canvas
  const middle = FAN_TEXTURE_PX / 2

  context.fillStyle = FLIGHT_COLORS.glass
  context.fillRect(0, 0, FAN_TEXTURE_PX, FAN_TEXTURE_PX)
  context.strokeStyle = FLIGHT_COLORS.metal
  context.lineWidth = 5
  for (let blade = 0; blade < ENGINE.blades; blade++) {
    const angle = (blade / ENGINE.blades) * Math.PI * 2
    context.beginPath()
    context.moveTo(middle + Math.cos(angle) * 22, middle + Math.sin(angle) * 22)
    context.quadraticCurveTo(
      middle + Math.cos(angle + 0.25) * 80,
      middle + Math.sin(angle + 0.25) * 80,
      middle + Math.cos(angle + 0.42) * middle,
      middle + Math.sin(angle + 0.42) * middle
    )
    context.stroke()
  }

  return canvas
}

class EngineServiceClass extends Service {
  /**
   * Both turbofans
   * @param {Three} three - Three namespace
   * @return {Group[]} - Nacelles with fan
   */

  build = (three: Three): Group[] => {
    const cowl = new three.MeshPhysicalMaterial({
      color: FLIGHT_COLORS.body,
      roughness: 0.3,
      metalness: 0.15,
      clearcoat: 1,
      clearcoatRoughness: 0.15,
      side: three.DoubleSide,
    })
    const metal = new three.MeshStandardMaterial({
      color: FLIGHT_COLORS.metal,
      roughness: 0.32,
      metalness: 0.9,
    })
    const fanMap = new three.CanvasTexture(fanTexture())
    fanMap.colorSpace = three.SRGBColorSpace
    const fan = new three.MeshStandardMaterial({ map: fanMap, roughness: 0.4, metalness: 0.8 })
    const lip = new three.MeshStandardMaterial({
      color: FLIGHT_COLORS.metal,
      roughness: 0.2,
      metalness: 1,
    })

    const [x, y, z] = ENGINE.centre

    return [-1, 1].map((side) => {
      const engine = new three.Group()

      // Cowl, lip ring, fan disc, spinner, plug
      const disc = new three.Mesh(new three.CircleGeometry(ENGINE.fanRadius, 40), fan)
      disc.rotation.y = Math.PI / 2
      disc.position.x = ENGINE.fanAt
      const spinner = new three.Mesh(
        latheOf(three, [
          [0, ENGINE.fanAt + 0.09],
          [0.025, ENGINE.fanAt + 0.06],
          [0.04, ENGINE.fanAt],
        ]),
        metal
      )
      const ring = new three.Mesh(new three.TorusGeometry(0.13, 0.008, 8, 48), lip)
      ring.rotation.y = Math.PI / 2
      ring.position.x = 0.368
      const pylon = new three.Mesh(new three.BoxGeometry(0.5, 0.09, 0.035), cowl)
      pylon.position.set(-0.05, 0.16, 0)

      engine.add(
        new three.Mesh(latheOf(three, ENGINE.cowl), cowl),
        new three.Mesh(latheOf(three, ENGINE.plug), metal),
        ring,
        disc,
        spinner,
        pylon
      )
      engine.position.set(x, y, z * side)

      return engine
    })
  }
}

// Turbofan nacelles
export const EngineService = new EngineServiceClass('engine')
