import type * as ThreeNamespace from 'three'

import { FLIGHT_LIGHTS, PLANE_LIGHTS } from '@/declarations/flight'
import { Service } from '@/structures/Service'

type Three = typeof ThreeNamespace

const DOME_RADIUS = 50
const SUN_RADIUS = 4
const ENVIRONMENT_BLUR = 0.03
const STROBE_HZ = 1.1
const BEACON_HZ = 0.8

// Opacity per pulse kind
const PULSES = {
  steady: () => 0.95,
  // Double flash
  strobe: (seconds: number) => {
    const phase = (seconds * STROBE_HZ) % 1

    return phase < 0.05 || (phase > 0.12 && phase < 0.16) ? 1 : 0
  },
  beacon: (seconds: number) =>
    0.15 + 0.85 * Math.pow(Math.max(0, Math.sin(seconds * Math.PI * 2 * BEACON_HZ)), 6),
} as const

class SkyLightServiceClass extends Service {
  /**
   * Sun, bounce and reflected sky
   * @param {Three} three - Three namespace
   * @param {ThreeNamespace.WebGLRenderer} renderer - Target renderer
   * @param {ThreeNamespace.Scene} scene - Lit scene
   * @return {Function} - Release the environment
   */

  light = (
    three: Three,
    renderer: ThreeNamespace.WebGLRenderer,
    scene: ThreeNamespace.Scene
  ): (() => void) => {
    const { sun, earth, rim, sky } = FLIGHT_LIGHTS
    const lights = [sun, earth, rim].map(({ color, intensity, position }) => {
      const light = new three.DirectionalLight(color, intensity)
      light.position.fromArray(position)

      return light
    })
    scene.add(...lights, new three.HemisphereLight(sky.color, sky.ground, sky.intensity))

    // Prefiltered dome for reflections
    const pmrem = new three.PMREMGenerator(renderer)
    const dome = this.dome(three)
    const target = pmrem.fromScene(dome, ENVIRONMENT_BLUR)
    scene.environment = target.texture
    scene.environmentIntensity = FLIGHT_LIGHTS.environment

    return () => {
      target.dispose()
      pmrem.dispose()
      dome.traverse((part) => {
        if (part instanceof three.Mesh) part.geometry.dispose()
      })
    }
  }

  /**
   * Blink the navigation lights
   * @param {ThreeNamespace.Sprite[]} lights - Declared order
   * @param {number} seconds - Clock
   * @return {void}
   */

  pulse = (lights: ThreeNamespace.Sprite[], seconds: number): void =>
    lights.forEach((sprite, index) => {
      const kind = PLANE_LIGHTS[index]?.pulse ?? 'steady'
      sprite.material.opacity = PULSES[kind](seconds + index * 0.07)
    })

  // Gradient sky and a hot sun
  private dome = (three: Three): ThreeNamespace.Scene => {
    const { zenith, horizon, nadir, sun } = FLIGHT_LIGHTS.dome
    const geometry = new three.SphereGeometry(DOME_RADIUS, 48, 24)
    const position = geometry.getAttribute('position')
    const colors = new Float32Array(position.count * 3)
    const [top, middle, bottom] = [zenith, horizon, nadir].map((hex) => new three.Color(hex))
    const color = new three.Color()

    // Horizon band fading both ways
    for (let index = 0; index < position.count; index++) {
      const height = position.getY(index) / DOME_RADIUS
      if (height >= 0 && top && middle) color.lerpColors(middle, top, Math.pow(height, 0.6))
      if (height < 0 && bottom && middle) color.lerpColors(middle, bottom, Math.pow(-height, 0.5))
      color.toArray(colors, index * 3)
    }
    geometry.setAttribute('color', new three.BufferAttribute(colors, 3))

    const scene = new three.Scene()
    scene.add(
      new three.Mesh(
        geometry,
        new three.MeshBasicMaterial({ vertexColors: true, side: three.BackSide })
      )
    )
    const disc = new three.Mesh(
      new three.SphereGeometry(SUN_RADIUS, 16, 8),
      new three.MeshBasicMaterial({ color: new three.Color(...sun) })
    )
    disc.position
      .set(...FLIGHT_LIGHTS.sun.position)
      .normalize()
      .multiplyScalar(DOME_RADIUS * 0.9)
    scene.add(disc)

    return scene
  }
}

// Flight scene lighting
export const SkyLightService = new SkyLightServiceClass('skyLight')
