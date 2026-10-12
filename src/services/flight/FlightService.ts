import type * as ThreeNamespace from 'three'

import { FLIGHT, FLIGHT_LIGHTS, FLIGHT_PATH_BACK } from '@/declarations/flight'
import { BannerService } from '@/services/flight/BannerService'
import { PlaneService } from '@/services/flight/PlaneService'
import { SkyLightService } from '@/services/flight/SkyLightService'
import { TrailService } from '@/services/flight/TrailService'
import { Service } from '@/structures/Service'
import type { FlightHandle, FlightMount, FlightSize } from '@/types/flight'
import { flightKeysOf, flightPhaseOf } from '@/utils/flightPath'
import { clampUnit } from '@/utils/motion'
import { hasWebGL } from '@/utils/webgl'

const { fieldOfView, near, far, trailSpan, trailSamples, headingStep, rollGain, rollLimit } = FLIGHT
const HALF_FOV_TAN = Math.tan((fieldOfView * Math.PI) / 360)

// Attitude share caught up per frame
const ATTITUDE_EASE = 0.18

class FlightServiceClass extends Service {
  /**
   * Start the flight scene
   * @param {FlightMount} request - Canvas, banner words and wake callback
   * @return {Promise<FlightHandle | null>} - Controls, null without WebGL
   */

  mount = async ({ canvas, bannerText, onWake }: FlightMount): Promise<FlightHandle | null> => {
    // No GPU, no engine: skip the download and the console noise
    if (!hasWebGL()) return null

    // The 3D engine only loads when the scene is near
    const three = await import('three')
    let renderer: ThreeNamespace.WebGLRenderer

    try {
      renderer = new three.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      })
    } catch {
      this.logger.warn('mount', 'WebGL unavailable')

      return null
    }

    renderer.toneMapping = three.ACESFilmicToneMapping
    renderer.toneMappingExposure = FLIGHT_LIGHTS.exposure
    renderer.setClearColor(0x000000, 0)

    const scene = new three.Scene()
    const releaseLights = SkyLightService.light(three, renderer, scene)

    const camera = new three.PerspectiveCamera(fieldOfView, 1, near, far)
    const rig = PlaneService.build(three)
    const banner = BannerService.build(three, bannerText)
    rig.group.add(banner.group)
    const ribbons = FLIGHT.trailOffsets.map(() => TrailService.create(three))
    scene.add(rig.group, ...ribbons.map((ribbon) => ribbon.mesh))

    let outCurve: ThreeNamespace.CatmullRomCurve3 | null = null
    let backCurve: ThreeNamespace.CatmullRomCurve3 | null = null
    let progress = 0
    let frameId = 0
    let isDisposed = false
    const startedAt = performance.now()

    // Camera space point to world
    const worldOf = (x: number, y: number, depth: number, aspect: number) =>
      new three.Vector3(x * HALF_FOV_TAN * aspect * depth, y * HALF_FOV_TAN * depth, -depth)

    const worldUp = new three.Vector3(0, 1, 0)
    const axes = {
      forward: new three.Vector3(),
      right: new three.Vector3(),
      up: new three.Vector3(),
      matrix: new three.Matrix4(),
      roll: new three.Quaternion(),
    }

    // Heading and bank at a position along a leg
    const orientAt = (
      curve: ThreeNamespace.CatmullRomCurve3,
      share: number,
      target: ThreeNamespace.Quaternion
    ): void => {
      const before = curve.getPoint(clampUnit(share - headingStep))
      const after = curve.getPoint(clampUnit(share + headingStep))
      const turn = (point: ThreeNamespace.Vector3) => Math.atan2(point.x, -point.z)
      const ahead = curve.getPoint(clampUnit(share + headingStep * 3))
      const behind = curve.getPoint(clampUnit(share - headingStep * 3))
      // Wrapped, a heading crossing ±π is no sudden turn
      const swing = turn(ahead.clone().sub(after)) - turn(before.clone().sub(behind))
      const rate = Math.atan2(Math.sin(swing), Math.cos(swing)) / headingStep

      axes.forward.subVectors(after, before).normalize()
      axes.right.crossVectors(axes.forward, worldUp).normalize()
      axes.up.crossVectors(axes.right, axes.forward)
      axes.roll.setFromAxisAngle(
        axes.forward,
        Math.max(-rollLimit, Math.min(rollLimit, rate * rollGain))
      )
      axes.right.applyQuaternion(axes.roll)
      axes.up.applyQuaternion(axes.roll)
      axes.matrix.makeBasis(axes.forward, axes.up, axes.right)
      target.setFromRotationMatrix(axes.matrix)
    }

    // Contrails trail the engines along the recent outbound path
    const trail = (share: number): void => {
      const curve = outCurve
      if (!curve) return
      const first = Math.max(0, share - trailSpan)
      const count = Math.max(2, Math.round(trailSamples * ((share - first) / trailSpan)))
      FLIGHT.trailOffsets.forEach((offset, index) => {
        const centres = Array.from({ length: count }, (_, step) => {
          const at = first + ((share - first) * step) / (count - 1)
          curve.getTangentAt(at, axes.forward)
          axes.right.crossVectors(axes.forward, worldUp).normalize()

          return curve
            .getPoint(at)
            .addScaledVector(axes.right, offset)
            .addScaledVector(worldUp, FLIGHT.trailDrop)
        })
        ribbons[index]?.update(centres, share > 0.04 ? count : 0)
      })
    }

    const orientation = new three.Quaternion()
    const tail = new three.Vector3()

    let lastLeg = ''

    const draw = (now: number) => {
      if (!outCurve || !backCurve) return
      const seconds = (now - startedAt) / 1000
      const { leg, share } = flightPhaseOf(progress)
      const curve = leg === 'back' ? backCurve : outCurve

      rig.group.visible = leg !== 'gap'
      banner.group.visible = leg === 'back'
      ribbons.forEach((ribbon) => ribbon.update([], 0))
      let edge = 0

      if (leg !== 'gap') {
        rig.group.position.copy(curve.getPoint(share))
        orientAt(curve, share, orientation)
        // Eased attitude, snapped on a new leg
        if (leg === lastLeg) rig.group.quaternion.slerp(orientation, ATTITUDE_EASE)
        else rig.group.quaternion.copy(orientation)
        lastLeg = leg
      }
      if (leg === 'out') trail(share)
      if (leg === 'back') {
        banner.update(seconds)
        rig.group.updateMatrixWorld(true)
        const projected = rig.group.localToWorld(banner.tailAt(seconds, tail)).project(camera)
        edge = (projected.x + 1) / 2
      }
      onWake(edge)

      SkyLightService.pulse(rig.lights, seconds)
      renderer.render(scene, camera)
    }

    const loop = (now: number) => {
      draw(now)
      frameId = requestAnimationFrame(loop)
    }

    return {
      frame: (value) => {
        progress = clampUnit(value)
        if (frameId === 0) draw(performance.now())
      },
      resize: (size: FlightSize) => {
        const aspect = size.width / size.height
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, FLIGHT.maxPixelRatio))
        renderer.setSize(size.width, size.height, false)
        camera.aspect = aspect
        camera.updateProjectionMatrix()
        camera.updateMatrixWorld(true)

        // Take-off point on the planet, then the fixed legs
        const origin = {
          x: (size.originX / size.width) * 2 - 1,
          y: 1 - (size.originY / size.height) * 2,
        }
        const curveOf = (keys: Array<{ x: number; y: number; depth: number }>) =>
          new three.CatmullRomCurve3(
            keys.map((key) => worldOf(key.x, key.y, key.depth, aspect)),
            false,
            'centripetal'
          )
        outCurve = curveOf(flightKeysOf(origin))
        // Narrow screens push the banner back so it fits
        const reach = Math.max(1, FLIGHT.bannerAspect / aspect)
        backCurve = curveOf(FLIGHT_PATH_BACK.map((key) => ({ ...key, depth: key.depth * reach })))
        draw(performance.now())
      },
      setActive: (isActive) => {
        cancelAnimationFrame(frameId)
        frameId = isActive && !isDisposed ? requestAnimationFrame(loop) : 0
      },
      dispose: () => {
        isDisposed = true
        cancelAnimationFrame(frameId)
        releaseLights()
        renderer.dispose()
      },
    }
  }
}

// Scroll driven airliner flight
export const FlightService = new FlightServiceClass('flight')
