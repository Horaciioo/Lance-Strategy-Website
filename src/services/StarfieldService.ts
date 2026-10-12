import type * as ThreeNamespace from 'three'

import { STAR_TINTS, STARFIELD } from '@/declarations/sky'
import { STAR_FRAGMENT_SHADER, STAR_VERTEX_SHADER } from '@/declarations/starShaders'
import { Service } from '@/structures/Service'
import type { StarfieldHandle } from '@/types/sky'
import { hasWebGL } from '@/utils/webgl'

type Three = typeof ThreeNamespace

const { count, bandCount, near, far, spread, bandTilt, bandWidth, seed } = STARFIELD
const NO_HANDLE: StarfieldHandle = { frame: () => undefined, stop: () => undefined }

// Seeded generator, same sky every visit
const randomOf = (start: number) => {
  let state = start

  return () => {
    state = (state * 16807) % 2147483647

    return (state - 1) / 2147483646
  }
}

interface StarfieldMount {
  canvas: HTMLCanvasElement
  isStill: boolean
}

class StarfieldServiceClass extends Service {
  /**
   * Start the 3D starfield
   * @param {StarfieldMount} options - Canvas and motion
   * @return {Promise<StarfieldHandle>} - Scroll controls
   */

  mount = async ({ canvas, isStill }: StarfieldMount): Promise<StarfieldHandle> => {
    // No GPU, no engine: skip the download and the console noise
    if (!hasWebGL()) return NO_HANDLE
    const three = await import('three')
    let renderer: ThreeNamespace.WebGLRenderer
    try {
      renderer = new three.WebGLRenderer({ canvas, alpha: true, antialias: false })
    } catch {
      this.logger.warn('mount', 'WebGL unavailable')

      return NO_HANDLE
    }

    // Scene and camera
    renderer.setClearColor(0x000000, 0)
    const scene = new three.Scene()
    const camera = new three.PerspectiveCamera(STARFIELD.fieldOfView, 1, 0.1, far * 2)
    const material = this.material(three)
    scene.add(new three.Points(this.geometry(three), material))

    // Pointer parallax target
    const pointer = { x: 0, y: 0, followX: 0, followY: 0 }
    const onPointer = (event: PointerEvent) => {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1
      pointer.y = (event.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onPointer, { passive: true })

    let progress = 0
    let frameId = 0
    let isVisible = true
    const startedAt = performance.now()

    // Dolly, drift and parallax
    const draw = (now: number) => {
      const seconds = isStill ? 0 : (now - startedAt) / 1000
      pointer.followX += (pointer.x - pointer.followX) * STARFIELD.follow
      pointer.followY += (pointer.y - pointer.followY) * STARFIELD.follow
      camera.position.set(0, 0, -progress * STARFIELD.travel)
      camera.rotation.set(
        -pointer.followY * STARFIELD.parallax,
        -pointer.followX * STARFIELD.parallax + seconds * STARFIELD.drift,
        seconds * STARFIELD.drift * 0.5
      )
      const { uTime } = material.uniforms
      if (uTime) uTime.value = seconds
      renderer.render(scene, camera)
    }
    const loop = (now: number) => {
      draw(now)
      frameId = isVisible && !isStill ? requestAnimationFrame(loop) : 0
    }

    // Size follows the canvas box
    const resize = () => {
      const { clientWidth: width, clientHeight: height } = canvas
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, STARFIELD.maxPixelRatio))
      renderer.setSize(width, height, false)
      camera.aspect = width / Math.max(height, 1)
      camera.updateProjectionMatrix()
      const { uPixelRatio } = material.uniforms
      if (uPixelRatio) uPixelRatio.value = renderer.getPixelRatio()
      draw(performance.now())
    }
    const resizing = new ResizeObserver(resize)
    resizing.observe(canvas)

    // Paused while off screen
    const watching = new IntersectionObserver(([entry]) => {
      isVisible = entry?.isIntersecting ?? true
      if (isVisible && frameId === 0) frameId = requestAnimationFrame(loop)
    })
    watching.observe(canvas)

    return {
      frame: (value) => {
        progress = value
        if (frameId === 0) draw(performance.now())
      },
      stop: () => {
        cancelAnimationFrame(frameId)
        frameId = -1
        isVisible = false
        resizing.disconnect()
        watching.disconnect()
        window.removeEventListener('pointermove', onPointer)
        renderer.dispose()
      },
    }
  }

  // Scattered stars plus a tilted band
  private geometry = (three: Three): ThreeNamespace.BufferGeometry => {
    const random = randomOf(seed)
    const total = count + bandCount
    const positions = new Float32Array(total * 3)
    const tints = new Float32Array(total * 3)
    const sizes = new Float32Array(total)
    const phases = new Float32Array(total)
    const cos = Math.cos(bandTilt)
    const sin = Math.sin(bandTilt)

    for (let index = 0; index < total; index++) {
      const isBand = index >= count
      const depth = near + random() * (far - near)
      let x = (random() - 0.5) * spread * 2
      let y = (random() - 0.5) * spread * 1.2
      // Band stars hug a tilted line
      if (isBand) {
        const along = (random() - 0.5) * spread * 2
        const across = (random() + random() + random() - 1.5) * bandWidth
        x = along * cos - across * sin
        y = along * sin + across * cos
      }
      positions.set([x, y, -depth], index * 3)
      tints.set(STAR_TINTS[Math.floor(random() * STAR_TINTS.length)] ?? [1, 1, 1], index * 3)
      sizes[index] = isBand ? 0.35 + random() * 0.4 : 0.5 + Math.pow(random(), 5) * 3.2
      phases[index] = random()
    }

    const geometry = new three.BufferGeometry()
    geometry.setAttribute('position', new three.BufferAttribute(positions, 3))
    geometry.setAttribute('aTint', new three.BufferAttribute(tints, 3))
    geometry.setAttribute('aSize', new three.BufferAttribute(sizes, 1))
    geometry.setAttribute('aPhase', new three.BufferAttribute(phases, 1))

    return geometry
  }

  private material = (three: Three): ThreeNamespace.ShaderMaterial =>
    new three.ShaderMaterial({
      vertexShader: STAR_VERTEX_SHADER,
      fragmentShader: STAR_FRAGMENT_SHADER,
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: STARFIELD.size },
        uPixelRatio: { value: 1 },
      },
      transparent: true,
      depthWrite: false,
      blending: three.AdditiveBlending,
    })
}

// Deep space behind the planet
export const StarfieldService = new StarfieldServiceClass('starfield')
