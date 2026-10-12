/**
 * Unit interval clamp
 * @param {number} value - Raw value
 * @return {number} - Value in 0..1
 */

export const clampUnit = (value: number): number => Math.min(1, Math.max(0, value))

/**
 * Linear blend
 * @param {number} from - Start value
 * @param {number} to - End value
 * @param {number} share - Progress
 * @return {number} - Blended value
 */

export const lerp = (from: number, to: number, share: number): number => from + (to - from) * share

/**
 * Smooth start and stop
 * @param {number} share - Progress
 * @return {number} - Eased progress
 */

export const easeInOutCubic = (share: number): number =>
  share < 0.5 ? 4 * share ** 3 : 1 - (-2 * share + 2) ** 3 / 2

/**
 * Fast start, soft landing
 * @param {number} share - Progress
 * @return {number} - Eased progress
 */

export const easeOutCubic = (share: number): number => 1 - (1 - share) ** 3

/**
 * Timeline progress
 * @param {number} elapsedMs - Time since start
 * @param {number} delayMs - Wait before start
 * @param {number} durationMs - Run time
 * @return {number} - Progress in 0..1
 */

export const progressOf = (elapsedMs: number, delayMs: number, durationMs: number): number =>
  clampUnit((elapsedMs - delayMs) / durationMs)
