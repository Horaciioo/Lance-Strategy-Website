import type { ShapeAnchor, ShapeDeclaration } from '@/types/shape'
import { shapeVariables } from '@/utils/shape'

const at = (share: number, rem = 0): ShapeAnchor => ({ share, rem })

// Container rail at lg and up
const RAIL_WIDTH = 86

// Reasons panel measures in rem
const REASONS = {
  tabDepth: 5,
  tabHalf: 20,
  tabSlope: 4,
  ctaDepth: 5.5,
  ctaWidth: 30,
  ctaSlope: 5,
  reach: 2,
  height: 38,
}

// Catalogue panel measures in rem
const CATALOG = {
  dropDepth: 4,
  dropSlope: 4,
  ctaWidth: 28,
  ctaDepth: 5,
  ctaSlope: 5,
  reach: 2,
  height: 64,
}

// Assessment box measures in rem
const BILAN = {
  tabHalf: 8,
  tabDepth: 3,
  tabSlope: 3,
  reach: 1.5,
  width: 56,
  height: 26,
}

// Slot board measures in rem
const SLOTS = {
  tabWidth: 17,
  tabDepth: 3.25,
  tabSlope: 3,
  notch: 2.5,
  reach: 1.25,
  width: 40,
  height: 30,
}

// Profile card measures in rem
const PROFILE = {
  tabWidth: 7,
  tabDepth: 1.5,
  tabSlope: 1,
  notch: 2.25,
  reach: 0.6,
  width: 9,
  height: 13,
}

// Group panel measures in rem
const GROUP = {
  dropDepth: 9,
  dropSlope: 4,
  soonWidth: 30,
  soonDepth: 4.5,
  soonSlope: 4,
  reach: 2,
  height: 58,
}

// Footer slab measures in rem
const FOOTER = {
  tabWidth: 18,
  tabDepth: 3,
  tabSlope: 3,
  reach: 1.5,
  width: 90,
  height: 24,
}

// Phone panels, one shared cut: tab top left over a share of the width
const PHONE = {
  tabShare: 0.78,
  tabDepth: 2.75,
  tabSlope: 2.25,
  notch: 2,
  reach: 1.25,
  width: 22,
  height: 40,
}

// Raised title tab, notched bottom left
const REASONS_SHAPE: ShapeDeclaration = {
  outline: [
    [at(0), at(0, REASONS.tabDepth)],
    [at(0.5, -(REASONS.tabHalf + REASONS.tabSlope)), at(0, REASONS.tabDepth)],
    [at(0.5, -REASONS.tabHalf), at(0)],
    [at(0.5, REASONS.tabHalf), at(0)],
    [at(0.5, REASONS.tabHalf + REASONS.tabSlope), at(0, REASONS.tabDepth)],
    [at(1), at(0, REASONS.tabDepth)],
    [at(1), at(1)],
    [at(0, REASONS.ctaWidth + REASONS.ctaSlope), at(1)],
    [at(0, REASONS.ctaWidth), at(1, -REASONS.ctaDepth)],
    [at(0), at(1, -REASONS.ctaDepth)],
  ],
  reach: REASONS.reach,
  box: { width: RAIL_WIDTH, height: REASONS.height },
  notches: { top: REASONS.tabDepth, bottom: REASONS.ctaDepth, left: REASONS.ctaWidth },
}

// City tab top left, flag notch bottom right
const PROFILE_SHAPE: ShapeDeclaration = {
  outline: [
    [at(0), at(0)],
    [at(0, PROFILE.tabWidth), at(0)],
    [at(0, PROFILE.tabWidth + PROFILE.tabSlope), at(0, PROFILE.tabDepth)],
    [at(1), at(0, PROFILE.tabDepth)],
    [at(1), at(1, -PROFILE.notch)],
    [at(1, -PROFILE.notch), at(1, -PROFILE.notch)],
    [at(1, -PROFILE.notch), at(1)],
    [at(0), at(1)],
  ],
  reach: PROFILE.reach,
  box: { width: PROFILE.width, height: PROFILE.height },
  notches: { tab: PROFILE.tabDepth, 'tab-width': PROFILE.tabWidth, corner: PROFILE.notch },
}

// Title tab top left, action notch bottom right
const CATALOG_SHAPE: ShapeDeclaration = {
  outline: [
    [at(0), at(0)],
    [at(0.5), at(0)],
    [at(0.5, CATALOG.dropSlope), at(0, CATALOG.dropDepth)],
    [at(1), at(0, CATALOG.dropDepth)],
    [at(1), at(1, -CATALOG.ctaDepth)],
    [at(1, -CATALOG.ctaWidth), at(1, -CATALOG.ctaDepth)],
    [at(1, -(CATALOG.ctaWidth + CATALOG.ctaSlope)), at(1)],
    [at(0), at(1)],
  ],
  reach: CATALOG.reach,
  box: { width: RAIL_WIDTH, height: CATALOG.height },
  notches: { top: CATALOG.dropDepth, bottom: CATALOG.ctaDepth, cta: CATALOG.ctaWidth },
}

// Kicker tab top center
const BILAN_SHAPE: ShapeDeclaration = {
  outline: [
    [at(0), at(0, BILAN.tabDepth)],
    [at(0.5, -(BILAN.tabHalf + BILAN.tabSlope)), at(0, BILAN.tabDepth)],
    [at(0.5, -BILAN.tabHalf), at(0)],
    [at(0.5, BILAN.tabHalf), at(0)],
    [at(0.5, BILAN.tabHalf + BILAN.tabSlope), at(0, BILAN.tabDepth)],
    [at(1), at(0, BILAN.tabDepth)],
    [at(1), at(1)],
    [at(0), at(1)],
  ],
  reach: BILAN.reach,
  box: { width: BILAN.width, height: BILAN.height },
  notches: { top: BILAN.tabDepth },
}

// Zone tab top left, clipped corner bottom right
const SLOTS_SHAPE: ShapeDeclaration = {
  outline: [
    [at(0), at(0)],
    [at(0, SLOTS.tabWidth), at(0)],
    [at(0, SLOTS.tabWidth + SLOTS.tabSlope), at(0, SLOTS.tabDepth)],
    [at(1), at(0, SLOTS.tabDepth)],
    [at(1), at(1, -SLOTS.notch)],
    [at(1, -SLOTS.notch), at(1)],
    [at(0), at(1)],
  ],
  reach: SLOTS.reach,
  box: { width: SLOTS.width, height: SLOTS.height },
  notches: { top: SLOTS.tabDepth, tab: SLOTS.tabWidth },
}

// Raised right half, soon notch bottom left
const GROUP_SHAPE: ShapeDeclaration = {
  outline: [
    [at(0), at(0, GROUP.dropDepth)],
    [at(0.5, -GROUP.dropSlope), at(0, GROUP.dropDepth)],
    [at(0.5), at(0)],
    [at(1), at(0)],
    [at(1), at(1)],
    [at(0, GROUP.soonWidth + GROUP.soonSlope), at(1)],
    [at(0, GROUP.soonWidth), at(1, -GROUP.soonDepth)],
    [at(0), at(1, -GROUP.soonDepth)],
  ],
  reach: GROUP.reach,
  box: { width: RAIL_WIDTH, height: GROUP.height },
  notches: { top: GROUP.dropDepth, bottom: GROUP.soonDepth, soon: GROUP.soonWidth },
}

// Raised tab top left, square elsewhere
const FOOTER_SHAPE: ShapeDeclaration = {
  outline: [
    [at(0), at(0), 0],
    [at(0, FOOTER.tabWidth), at(0)],
    [at(0, FOOTER.tabWidth + FOOTER.tabSlope), at(0, FOOTER.tabDepth)],
    [at(1), at(0, FOOTER.tabDepth), 0],
    [at(1), at(1), 0],
    [at(0), at(1), 0],
  ],
  reach: FOOTER.reach,
  box: { width: FOOTER.width, height: FOOTER.height },
  notches: { top: FOOTER.tabDepth, tab: FOOTER.tabWidth },
}

// Phone cut, a tab wide enough for its label whatever the screen, clipped corner bottom right
const PHONE_SHAPE: ShapeDeclaration = {
  outline: [
    [at(0), at(0)],
    [at(PHONE.tabShare), at(0)],
    [at(PHONE.tabShare, PHONE.tabSlope), at(0, PHONE.tabDepth)],
    [at(1), at(0, PHONE.tabDepth)],
    [at(1), at(1, -PHONE.notch)],
    [at(1, -PHONE.notch), at(1)],
    [at(0), at(1)],
  ],
  reach: PHONE.reach,
  box: { width: PHONE.width, height: PHONE.height },
  notches: { top: PHONE.tabDepth },
}

/**
 * Group panel variables
 * @type {Record<string, string>}
 */

export const GROUP_PANEL_VARIABLES: Record<string, string> = shapeVariables(
  GROUP_SHAPE,
  PHONE_SHAPE
)

/**
 * Footer slab variables
 * @type {Record<string, string>}
 */

export const FOOTER_SLAB_VARIABLES: Record<string, string> = shapeVariables(FOOTER_SHAPE)

/**
 * Assessment box variables
 * @type {Record<string, string>}
 */

export const BILAN_BOX_VARIABLES: Record<string, string> = shapeVariables(BILAN_SHAPE, PHONE_SHAPE)

/**
 * Slot board variables
 * @type {Record<string, string>}
 */

export const SLOT_BOARD_VARIABLES: Record<string, string> = shapeVariables(SLOTS_SHAPE, PHONE_SHAPE)

/**
 * Catalogue panel variables
 * @type {Record<string, string>}
 */

export const CATALOG_PANEL_VARIABLES: Record<string, string> = shapeVariables(
  CATALOG_SHAPE,
  PHONE_SHAPE
)

/**
 * Profile card variables
 * @type {Record<string, string>}
 */

export const PROFILE_CARD_VARIABLES: Record<string, string> = shapeVariables(PROFILE_SHAPE)

/**
 * Reasons panel variables
 * @type {Record<string, string>}
 */

export const REASONS_PANEL_VARIABLES: Record<string, string> = shapeVariables(REASONS_SHAPE)
