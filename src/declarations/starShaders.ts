/**
 * Star sprite placement, size by depth
 * @type {string}
 */

export const STAR_VERTEX_SHADER = `
attribute float aSize;
attribute float aPhase;
attribute vec3 aTint;

uniform float uTime;
uniform float uSize;
uniform float uPixelRatio;

varying vec3 vTint;
varying float vGlow;

void main() {
  vec4 view = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * view;
  float depth = max(-view.z, 0.1);

  // Slow scintillation
  float twinkle = 0.75 + 0.25 * sin(uTime * (0.6 + aPhase * 1.7) + aPhase * 40.0);
  gl_PointSize = clamp(aSize * uSize * uPixelRatio / depth, 1.0, 9.0 * uPixelRatio);
  vTint = aTint;
  // Far stars stay faint, near ones pop
  vGlow = twinkle * mix(0.3, 1.0, smoothstep(170.0, 20.0, depth));
}
`

/**
 * Soft round star, bright core
 * @type {string}
 */

export const STAR_FRAGMENT_SHADER = `
varying vec3 vTint;
varying float vGlow;

void main() {
  float r = length(gl_PointCoord - 0.5) * 2.0;
  float core = smoothstep(0.5, 0.0, r);
  float halo = smoothstep(1.0, 0.0, r) * 0.35;
  float alpha = (core + halo) * vGlow;
  if (alpha < 0.01) discard;
  gl_FragColor = vec4(vTint * alpha, alpha);
}
`
