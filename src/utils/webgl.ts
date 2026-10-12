/**
 * WebGL 2 probe, context released right away
 * @return {boolean} - Whether a context can be created
 */

export const hasWebGL = (): boolean => {
  const probe = document.createElement('canvas').getContext('webgl2')
  probe?.getExtension('WEBGL_lose_context')?.loseContext()

  return probe !== null
}
