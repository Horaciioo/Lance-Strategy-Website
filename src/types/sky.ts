/**
 * Starfield controls
 * @typedef StarfieldHandle
 * @property {Function} frame - Scroll share
 * @property {Function} stop - Teardown
 */

export interface StarfieldHandle {
  frame: (progress: number) => void
  stop: () => void
}
