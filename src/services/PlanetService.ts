import { GLOBE_PLANET, GLOBE_TEXTURES } from '@/declarations/globe'
import { PLANET_FRAGMENT_SHADER, PLANET_VERTEX_SHADER } from '@/declarations/planetShaders'
import { LoggerService } from '@/services/LoggerService'
import { Service } from '@/structures/Service'
import type { PlanetFrame, PlanetHandle, Vector } from '@/types/globe'
import { project } from '@/utils/geo'

const UNIFORMS = [
  'uResolution',
  'uCenter',
  'uRadius',
  'uReach',
  'uGlow',
  'uBasis',
  'uSun',
  'uDay',
  'uNight',
  'uClouds',
  'uHeight',
  'uTexel',
  'uDrift',
  'uTime',
  'uPresence',
  'uRelief',
] as const

type UniformName = (typeof UNIFORMS)[number]

// Texture units, one per map
const UNITS = { uDay: 0, uNight: 1, uClouds: 2, uHeight: 3 } as const

// Dark placeholder until each map arrives
const PLACEHOLDERS = {
  uDay: [4, 12, 40],
  uNight: [0, 0, 0],
  uClouds: [0, 0, 0],
  uHeight: [0, 0, 0],
} as const

// Fallback texel size, replaced per map
const DEFAULT_TEXEL = 1 / 2048
const MAX_ANISOTROPY = 8
const CORNERS = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1])
const AXES: Vector[] = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
]

// Fixed view light, globe space
const sunOf = (basis: number[]): Vector => {
  const [x, y, z] = GLOBE_PLANET.sunView
  const length = Math.hypot(x, y, z)

  return [0, 1, 2].map(
    (axis) =>
      ((basis[axis * 3] ?? 0) * x +
        (basis[axis * 3 + 1] ?? 0) * y +
        (basis[axis * 3 + 2] ?? 0) * z) /
      length
  ) as Vector
}

const compile = (gl: WebGL2RenderingContext, kind: number, source: string): WebGLShader | null => {
  const shader = gl.createShader(kind)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader
  LoggerService.warn('planet.compile', gl.getShaderInfoLog(shader))

  return null
}

class PlanetServiceClass extends Service {
  /**
   * Start the GPU planet
   * @param {HTMLCanvasElement} canvas - Target canvas
   * @return {PlanetHandle | null} - Controls, null without WebGL
   */

  mount = (canvas: HTMLCanvasElement): PlanetHandle | null => {
    const gl = canvas.getContext('webgl2', {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      powerPreference: 'high-performance',
    })
    const vertex = gl && compile(gl, gl.VERTEX_SHADER, PLANET_VERTEX_SHADER)
    const fragment = gl && compile(gl, gl.FRAGMENT_SHADER, PLANET_FRAGMENT_SHADER)
    const program = gl?.createProgram()
    if (!gl || !vertex || !fragment || !program) return null

    gl.attachShader(program, vertex)
    gl.attachShader(program, fragment)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      this.logger.warn('mount', 'program link failed')

      return null
    }

    gl.useProgram(program)
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
    gl.bufferData(gl.ARRAY_BUFFER, CORNERS, gl.STATIC_DRAW)
    const corner = gl.getAttribLocation(program, 'aCorner')
    gl.enableVertexAttribArray(corner)
    gl.vertexAttribPointer(corner, 2, gl.FLOAT, false, 0, 0)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)

    const slots = Object.fromEntries(
      UNIFORMS.map((name) => [name, gl.getUniformLocation(program, name)])
    ) as Record<UniformName, WebGLUniformLocation | null>

    const texels = { day: DEFAULT_TEXEL, height: DEFAULT_TEXEL }
    let isLost = false
    let isDisposed = false
    const textures: WebGLTexture[] = []
    const anisotropic = gl.getExtension('EXT_texture_filter_anisotropic')

    // Placeholder first, the real map swaps in when decoded
    const bindMap = (name: keyof typeof UNITS, source: string) => {
      const texture = gl.createTexture()
      if (!texture) return
      textures.push(texture)
      gl.activeTexture(gl.TEXTURE0 + UNITS[name])
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        1,
        1,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        new Uint8Array([...PLACEHOLDERS[name], 255])
      )
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.uniform1i(slots[name], UNITS[name])

      const image = new Image()
      image.decoding = 'async'
      image.onload = () => {
        if (isDisposed || isLost) return
        gl.activeTexture(gl.TEXTURE0 + UNITS[name])
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
        // Mipmaps keep the small globe crisp
        gl.generateMipmap(gl.TEXTURE_2D)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
        if (anisotropic)
          gl.texParameterf(
            gl.TEXTURE_2D,
            anisotropic.TEXTURE_MAX_ANISOTROPY_EXT,
            Math.min(MAX_ANISOTROPY, gl.getParameter(anisotropic.MAX_TEXTURE_MAX_ANISOTROPY_EXT))
          )
        if (name === 'uDay') texels.day = 1 / image.naturalWidth
        if (name === 'uHeight') texels.height = 1 / image.naturalWidth
      }
      image.onerror = () => this.logger.warn('texture', source)
      image.src = source
    }
    bindMap('uDay', GLOBE_TEXTURES.day)
    bindMap('uNight', GLOBE_TEXTURES.night)
    bindMap('uClouds', GLOBE_TEXTURES.clouds)
    bindMap('uHeight', GLOBE_TEXTURES.height)

    const onLost = (event: Event) => {
      event.preventDefault()
      isLost = true
    }
    canvas.addEventListener('webglcontextlost', onLost)

    return {
      draw: (frame: PlanetFrame) => {
        if (isLost) return
        const { width, height, pixelRatio, radius, centerX, centerY } = frame
        const pixelWidth = Math.round(width * pixelRatio)
        const pixelHeight = Math.round(height * pixelRatio)

        if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
          canvas.width = pixelWidth
          canvas.height = pixelHeight
        }
        gl.viewport(0, 0, pixelWidth, pixelHeight)
        gl.clearColor(0, 0, 0, 0)
        gl.clear(gl.COLOR_BUFFER_BIT)

        // View coordinates of each globe axis, as matrix columns
        const basis = AXES.flatMap((axis) => {
          const point = project(axis, frame.camera)

          return [point.x, point.y, point.depth]
        })
        const sun = sunOf(basis)

        gl.uniform2f(slots.uResolution, width, height)
        gl.uniform2f(slots.uCenter, centerX, centerY)
        gl.uniform1f(slots.uRadius, radius)
        gl.uniform1f(slots.uReach, radius * GLOBE_PLANET.atmosphereReach)
        gl.uniform1f(slots.uGlow, GLOBE_PLANET.atmosphereReach)
        gl.uniformMatrix3fv(slots.uBasis, false, basis)
        gl.uniform3f(slots.uSun, sun[0], sun[1], sun[2])
        gl.uniform2f(slots.uTexel, texels.day, texels.height)
        gl.uniform1f(slots.uDrift, frame.cloudDrift)
        gl.uniform1f(slots.uTime, frame.time)
        gl.uniform1f(slots.uPresence, frame.presence)
        gl.uniform1f(slots.uRelief, GLOBE_PLANET.relief)
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      },
      dispose: () => {
        isDisposed = true
        canvas.removeEventListener('webglcontextlost', onLost)
        textures.forEach((texture) => gl.deleteTexture(texture))
        gl.deleteProgram(program)
      },
    }
  }
}

// GPU lit planet
export const PlanetService = new PlanetServiceClass('planet')
