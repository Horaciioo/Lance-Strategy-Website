import {
  DISABLED,
  FOCUS_RING,
  SURFACES,
  TONE_SOFT,
  TRANSITION,
  TRANSITION_ALL,
} from '@/declarations/ui/tokens'
import type { Size, Tone } from '@/types/common'

// Press feedback, colours and shadow
const PRESS =
  'transition-[transform,background-color,border-color,color,box-shadow] duration-fast ease-out active:scale-[0.97]'

/**
 * Button base styles
 * @type {string}
 */

export const BUTTON_BASE = `group/button inline-flex items-center justify-center gap-2 rounded-pill font-medium tracking-[-0.01em] whitespace-nowrap ${PRESS} ${FOCUS_RING} ${DISABLED}`

/**
 * Button sizes
 * @type {Record<Size, string>}
 */

export const BUTTON_SIZES: Record<Size, string> = {
  sm: 'h-8 px-3.5 text-xs',
  md: 'h-10 px-5 text-sm',
  lg: 'h-12 px-6 text-[0.9375rem]',
}

/**
 * Button variants
 * @type {Object}
 */

export const BUTTON_VARIANTS = {
  // Lit top edge, deepens on hover
  primary:
    'bg-primary text-primary-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.14),0_1px_2px_rgb(var(--color-overlay)/0.3)] hover:bg-primary-hover hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.2),0_6px_18px_-8px_rgb(var(--color-overlay)/0.6)]',
  secondary: 'bg-surface-strong text-foreground hover:bg-border',
  outline:
    'border border-border-strong bg-background/40 text-foreground hover:border-foreground hover:bg-background',
  ghost: 'text-foreground-muted hover:bg-surface-strong hover:text-foreground',
  link: 'text-accent underline-offset-4 hover:underline px-0 h-auto',
  danger: 'bg-danger text-background hover:brightness-90',
  // Over the night scene
  onMedia: 'bg-sky-ink text-cover hover:bg-white',
  // Outline over the night scene
  onMediaOutline:
    'border border-sky-ink/30 text-sky-ink hover:border-sky-ink/70 hover:bg-sky-ink/10',
} as const

/**
 * Button variant name
 * @typedef {keyof typeof BUTTON_VARIANTS} ButtonVariant
 */

export type ButtonVariant = keyof typeof BUTTON_VARIANTS

/**
 * Button size name
 * @typedef {Size} ButtonSize
 */

export type ButtonSize = Size

/**
 * Icon button sizes
 * @type {Record<Size, string>}
 */

export const ICON_BUTTON_SIZES: Record<Size, string> = {
  sm: 'h-8 w-8 p-0',
  md: 'h-10 w-10 p-0',
  lg: 'h-12 w-12 p-0',
}

/**
 * Action icon size
 * @type {Record<Size, 'xs' | 'sm' | 'md'>}
 */

export const ACTION_ICON_SIZES: Record<Size, 'xs' | 'sm' | 'md'> = { sm: 'xs', md: 'sm', lg: 'md' }

/**
 * Trailing icon nudge
 * @type {string}
 */

export const ACTION_ICON_NUDGE =
  'transition-transform duration-fast ease-out group-hover/button:translate-x-0.5'

/**
 * Icon button icon sizes
 * @type {Record<Size, 'sm' | 'md'>}
 */

export const ICON_BUTTON_ICON_SIZES: Record<Size, 'sm' | 'md'> = { sm: 'sm', md: 'sm', lg: 'md' }

/**
 * Badge base styles
 * @type {string}
 */

export const BADGE_BASE =
  'inline-flex items-center gap-1.5 rounded-pill font-medium whitespace-nowrap'

/**
 * Badge sizes
 * @type {Record<Size, string>}
 */

export const BADGE_SIZES: Record<Size, string> = {
  sm: 'px-2 py-0.5 text-[0.6875rem]',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
}

/**
 * Badge variants
 * @type {Object}
 */

export const BADGE_VARIANTS = {
  soft: TONE_SOFT,
  outline: {
    neutral: 'border border-border text-foreground-muted',
    primary: 'border border-primary/40 text-primary',
    accent: 'border border-accent/40 text-accent',
    success: 'border border-success/40 text-success',
    warning: 'border border-warning/40 text-warning',
    danger: 'border border-danger/40 text-danger',
    info: 'border border-info/40 text-info',
  },
} as const satisfies Record<string, Record<Tone, string>>

/**
 * Badge variant name
 * @typedef {keyof typeof BADGE_VARIANTS} BadgeVariant
 */

export type BadgeVariant = keyof typeof BADGE_VARIANTS

/**
 * Text styles
 * @type {Object}
 */

export const TEXT_STYLES = {
  pageTitle: 'text-3xl sm:text-4xl font-semibold tracking-tight text-foreground',
  sectionTitle: 'text-2xl sm:text-3xl font-semibold tracking-tight text-foreground',
  blockTitle: 'text-lg font-semibold text-foreground',
  lead: 'text-lg text-foreground-muted leading-relaxed',
  body: 'text-sm text-foreground leading-relaxed',
  description: 'text-sm text-foreground-muted leading-relaxed',
  meta: 'text-xs text-foreground-subtle',
  label: 'text-sm font-medium text-foreground',
  // Hero lettering, map scale
  display:
    'text-[length:clamp(2.5rem,5vw,4.5rem)] font-medium leading-[1.12] tracking-[-0.03em] text-foreground',
  overline: 'text-xs font-semibold uppercase tracking-[0.18em] text-accent',
  code: 'font-mono text-xs text-foreground-muted',
} as const

/**
 * Text style name
 * @typedef {keyof typeof TEXT_STYLES} TextStyle
 */

export type TextStyle = keyof typeof TEXT_STYLES

/**
 * Heading styles
 * @type {Object}
 */

export const HEADING_STYLES = {
  1: TEXT_STYLES.pageTitle,
  2: TEXT_STYLES.sectionTitle,
  3: TEXT_STYLES.blockTitle,
  4: 'text-base font-semibold text-foreground',
} as const

/**
 * Heading level name
 * @typedef {keyof typeof HEADING_STYLES} HeadingLevel
 */

export type HeadingLevel = keyof typeof HEADING_STYLES

/**
 * Field styles
 * @type {Object}
 */

export const FIELD_STYLES = {
  // Honeypot position
  trap: 'absolute -left-[9999px] top-auto h-px w-px overflow-hidden',
  wrapper: 'flex flex-col gap-1.5',
  label: `${TEXT_STYLES.label} flex items-center gap-1`,
  required: 'text-danger',
  control: `w-full rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-foreground-subtle ${TRANSITION} ${FOCUS_RING} ${DISABLED} hover:border-border-strong`,
  controlHeight: 'h-10',
  controlWithIcon: 'pl-10',
  textarea: 'min-h-32 py-2.5 resize-y',
  invalid: 'border-danger focus-visible:ring-danger/40',
  icon: 'pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-foreground-subtle',
  hint: TEXT_STYLES.meta,
  error: 'text-xs text-danger',
  choice: `flex items-start gap-2.5 text-sm text-foreground cursor-pointer ${DISABLED}`,
  checkbox: `h-4 w-4 mt-0.5 shrink-0 rounded-xs border border-border-strong text-primary accent-primary ${FOCUS_RING}`,
  switchTrack: `relative h-6 w-11 shrink-0 rounded-pill border border-transparent bg-border-strong ${TRANSITION} ${FOCUS_RING} data-[checked=true]:bg-primary`,
  switchThumb:
    'block h-5 w-5 translate-x-0.5 rounded-pill bg-background shadow-xs transition-transform duration-base data-[checked=true]:translate-x-[1.375rem]',
  grid: 'grid grid-cols-1 gap-4 sm:grid-cols-2',
  wide: 'sm:col-span-2',
} as const

/**
 * Skeleton base styles
 * @type {string}
 */

export const SKELETON_BASE = 'surface-shimmer animate-shimmer rounded-md'

/**
 * Skeleton shapes
 * @type {Object}
 */

export const SKELETON_SHAPES = {
  line: 'h-3 w-full',
  title: 'h-6 w-2/5',
  text: 'h-3 w-3/4',
  row: 'h-12 w-full',
  card: 'h-40 w-full rounded-lg',
  avatar: 'h-10 w-10 rounded-pill',
  button: 'h-10 w-28',
} as const

/**
 * Skeleton shape name
 * @typedef {keyof typeof SKELETON_SHAPES} SkeletonShape
 */

export type SkeletonShape = keyof typeof SKELETON_SHAPES

/**
 * Page skeleton styles
 * @type {Object}
 */

export const PAGE_SKELETON_STYLES = {
  header: 'flex flex-col gap-3',
  title: 'h-8 w-1/3',
  description: 'h-4 w-2/3',
  block: `${SURFACES.card} p-5`,
} as const

/**
 * Empty state styles
 * @type {Object}
 */

export const EMPTY_STATE_STYLES = {
  frame: 'flex flex-col items-center justify-center gap-3 rounded-lg px-6 py-12 text-center',
  start: {
    frame: `${SURFACES.card} border-dashed`,
    iconTile: `flex h-12 w-12 items-center justify-center rounded-pill ${TONE_SOFT.primary}`,
    icon: 'h-6 w-6',
    figure: 'h-28 w-28 text-primary/70',
  },
  filter: {
    frame: SURFACES.inset,
    iconTile: `flex h-12 w-12 items-center justify-center rounded-pill ${TONE_SOFT.neutral}`,
    icon: 'h-6 w-6',
    figure: 'h-28 w-28 text-foreground-subtle',
  },
} as const

/**
 * Empty state variant name
 * @typedef {Exclude<keyof typeof EMPTY_STATE_STYLES, 'frame'>} EmptyStateVariant
 */

export type EmptyStateVariant = Exclude<keyof typeof EMPTY_STATE_STYLES, 'frame'>

/**
 * Alert styles
 * @type {Object}
 */

export const ALERT_STYLES = {
  frame: 'flex items-start gap-3 rounded-lg border p-4',
  icon: 'mt-0.5 h-5 w-5 shrink-0',
  content: 'flex flex-col gap-1',
  // Ink stays neutral, the tone lives in the icon
  title: 'text-sm font-semibold text-foreground',
  description: 'text-sm text-foreground-muted',
} as const

/**
 * Spinner sizes
 * @type {Record<Size, string>}
 */

export const SPINNER_SIZES: Record<Size, string> = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-9 w-9',
}

/**
 * Avatar sizes
 * @type {Record<Size, string>}
 */

export const AVATAR_SIZES: Record<Size, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
}

/**
 * Avatar pixel sizes
 * @type {Record<Size, number>}
 */

export const AVATAR_PIXELS: Record<Size, number> = { sm: 32, md: 40, lg: 56 }

/**
 * Avatar styles
 * @type {Object}
 */

export const AVATAR_STYLES = {
  frame: `flex shrink-0 items-center justify-center overflow-hidden rounded-pill font-semibold ${TONE_SOFT.primary}`,
  image: 'h-full w-full object-cover',
} as const

/**
 * Progress bar styles
 * @type {Object}
 */

export const PROGRESS_STYLES = {
  track: 'h-2 w-full overflow-hidden rounded-pill bg-surface-strong',
  bar: 'h-full rounded-pill transition-[width] duration-slow ease-out',
} as const

/**
 * Overlay styles
 * @type {Object}
 */

export const OVERLAY_STYLES = {
  backdrop: 'fixed inset-0 bg-overlay/50 backdrop-blur-sm animate-fade-in',
  centered: 'fixed inset-0 flex items-end justify-center p-4 sm:items-center',
  panel: `relative w-full ${SURFACES.raised} shadow-lg animate-slide-up`,
  panelSizes: {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-3xl',
  } satisfies Record<Size, string>,
  header: 'flex items-start justify-between gap-4 border-b border-border px-5 py-4',
  body: 'px-5 py-4',
  footer: 'flex flex-wrap justify-end gap-2 border-t border-border px-5 py-4',
} as const

/**
 * Drawer styles
 * @type {Object}
 */

export const DRAWER_STYLES = {
  panel: `fixed inset-y-0 right-0 flex w-full max-w-sm flex-col bg-background shadow-lg animate-slide-left`,
  header: OVERLAY_STYLES.header,
  body: 'flex-1 overflow-y-auto px-5 py-4',
} as const

/**
 * Tooltip styles
 * @type {Object}
 */

export const TOOLTIP_STYLES = {
  wrapper: 'relative inline-flex',
  bubble:
    'pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs text-background opacity-0 shadow-md transition-opacity duration-fast group-hover:opacity-100 group-focus-within:opacity-100',
} as const

/**
 * Tab styles
 * @type {Object}
 */

export const TABS_STYLES = {
  list: 'flex gap-1 overflow-x-auto border-b border-border',
  trigger: `-mb-px border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-foreground-muted ${TRANSITION} ${FOCUS_RING} hover:text-foreground`,
  triggerActive: 'border-primary text-foreground',
  panel: 'pt-5 animate-fade-in',
} as const

/**
 * Accordion styles
 * @type {Object}
 */

export const ACCORDION_STYLES = {
  list: 'border-t border-border',
  item: 'group border-b border-border',
  trigger: `flex w-full items-center justify-between gap-6 py-5 text-left text-base font-medium text-foreground ${TRANSITION} ${FOCUS_RING} hover:text-primary`,
  indicator: `h-4 w-4 shrink-0 text-foreground-subtle ${TRANSITION_ALL} data-[open=true]:rotate-180 group-hover:text-primary`,
  panel: 'pb-6 pr-10 text-sm leading-relaxed text-foreground-muted animate-fade-in',
} as const

/**
 * Table styles
 * @type {Object}
 */

export const TABLE_STYLES = {
  scroller: 'w-full overflow-x-auto',
  table: 'w-full border-collapse text-left text-sm',
  headCell:
    'border-b border-border px-4 py-3 text-xs font-semibold uppercase tracking-wide text-foreground-subtle',
  row: `border-b border-border last:border-0 ${TRANSITION} hover:bg-surface`,
  cell: 'px-4 py-3 text-foreground',
  empty: 'px-4 py-10 text-center',
} as const

/**
 * Pagination styles
 * @type {Object}
 */

export const PAGINATION_STYLES = {
  frame: 'flex flex-wrap items-center justify-between gap-3 pt-1',
  actions: 'flex gap-2',
} as const

/**
 * Navigation header styles
 * @type {Object}
 */

export const NAVIGATION_STYLES = {
  header: 'sticky top-0 w-full',
  // Room around the floating bar
  shell: 'px-3 pt-3 sm:px-5',
  bar: 'relative mx-auto flex h-14 max-w-container items-center justify-between gap-4 pl-2 pr-1.5 sm:pl-3',
  // Capsule that fills in once off the night scene
  backdrop:
    'pointer-events-none absolute inset-0 rounded-pill border border-border/70 bg-background/80 shadow-[0_10px_30px_-18px_rgb(var(--color-overlay)/0.45)] backdrop-blur-xl transition-[opacity,transform] duration-slow ease-out',
  backdropHidden: 'scale-[0.98] opacity-0',
  list: 'relative hidden items-center lg:flex',
  link: `relative z-10 rounded-pill px-4 py-2 text-sm text-foreground-muted ${TRANSITION} ${FOCUS_RING} hover:text-foreground`,
  linkActive: 'text-foreground',
  // Follows the hovered link
  highlight: 'absolute inset-0 -z-10 rounded-pill bg-foreground/[0.07]',
  actions: 'relative flex items-center gap-1.5',
  wide: 'hidden lg:inline-flex',
  narrow: 'lg:hidden',
  mobileList: 'flex flex-col gap-1',
  mobileLink: `rounded-lg px-3 py-2.5 text-base font-medium text-foreground-muted ${TRANSITION} hover:bg-surface hover:text-foreground`,
  brand: `relative flex items-center rounded-pill ${FOCUS_RING}`,
} as const

/**
 * Language switcher styles
 * @type {Object}
 */

export const LANGUAGE_SWITCHER_STYLES = {
  frame: `relative inline-flex items-center gap-2 rounded-pill pl-3 pr-7 ${TRANSITION} hover:bg-foreground/[0.07]`,
  flag: 'text-base leading-none',
  // Transparent native control, the frame around it carries the styling
  select: `cursor-pointer appearance-none bg-transparent py-2 text-sm text-foreground-muted ${FOCUS_RING} hover:text-foreground`,
  indicator: 'pointer-events-none absolute right-2.5 text-foreground-subtle',
} as const

/**
 * Language picker styles
 * @type {Object}
 */

export const LANGUAGE_PICKER_STYLES = {
  root: 'relative',
  trigger: `inline-flex size-10 items-center justify-center rounded-pill text-xl leading-none ${TRANSITION} hover:bg-foreground/[0.07] ${FOCUS_RING}`,
  // Floats under the flag
  list: 'absolute right-0 top-full z-20 mt-3 flex w-48 flex-col gap-1 rounded-lg border border-border bg-background p-1.5 shadow-lg',
  option: `flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm text-foreground-muted ${TRANSITION} hover:bg-foreground/[0.07] hover:text-foreground ${FOCUS_RING}`,
  optionActive: 'bg-foreground/[0.07] text-foreground',
  flag: 'text-base leading-none',
} as const

/**
 * Logo styles
 * @type {Object}
 */

export const LOGO_STYLES = {
  // Dark chip, the wordmark is white on blue
  chip: 'relative flex items-center rounded-pill px-4 py-1.5',
  flat: 'relative flex items-center',
  backdrop: 'absolute inset-0 rounded-pill bg-sky-top',
  image: 'relative h-9 w-auto',
  // Flown from the landing title, never catches clicks
  flying: 'pointer-events-none origin-top-left',
} as const

/**
 * Footer styles
 * @type {Object}
 */

export const FOOTER_STYLES = {
  // One slab, raised tab top left
  frame: 'relative mt-24 bg-surface pt-[var(--notch-top)] [clip-path:var(--shape-clip)]',
  tab: 'absolute left-0 top-0 flex h-[var(--notch-top)] w-[var(--notch-tab)] items-center px-4 font-semibold text-foreground sm:px-6 lg:px-10',
  grid: 'grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4',
  // Tagline under the logo tab, clear of it
  brand: 'flex flex-col gap-3 pt-8',
  accent: 'text-accent',
  columnTitle: 'text-xs font-semibold uppercase tracking-wider text-foreground-subtle',
  list: 'mt-4 flex flex-col gap-2',
  link: `text-sm text-foreground-muted ${TRANSITION} hover:text-foreground`,
  bottom:
    'flex flex-col gap-4 border-t border-border py-6 sm:flex-row sm:items-center sm:justify-between',
  settings: 'flex items-center gap-2',
  socials: 'flex gap-2',
} as const

/**
 * Toast styles
 * @type {Object}
 */

export const TOAST_STYLES = {
  region:
    'pointer-events-none fixed inset-x-0 bottom-0 flex flex-col items-center gap-2 p-4 sm:items-end',
  toast: `pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border p-4 shadow-md animate-slide-up`,
} as const

/**
 * Card styles
 * @type {Object}
 */

export const CARD_STYLES = {
  frame: `${SURFACES.card} ${TRANSITION_ALL} overflow-hidden`,
  interactive: 'hover:border-border-strong hover:shadow-md',
  body: 'flex flex-col gap-2 p-5',
  media: 'relative aspect-[4/3] w-full overflow-hidden bg-surface-strong',
  mediaImage: `h-full w-full object-cover ${TRANSITION_ALL} group-hover:scale-105`,
} as const

/**
 * Stat tile styles
 * @type {Object}
 */

export const STAT_STYLES = {
  frame: `${SURFACES.card} flex flex-col gap-1 p-5`,
  value: 'font-display text-3xl font-semibold tracking-tight text-foreground',
  iconTile: `mb-2 flex h-10 w-10 items-center justify-center rounded-md`,
} as const

/**
 * Section styles
 * @type {Object}
 */

export const SECTION_STYLES = {
  header: 'flex flex-col gap-3',
  headerCentered: 'mx-auto max-w-narrow text-center',
  body: 'mt-10',
} as const

/**
 * Layout utilities
 * @type {Object}
 */

export const LAYOUT = {
  page: 'flex min-h-screen flex-col',
  main: 'flex-1',
  container: 'mx-auto w-full px-4 sm:px-6 lg:px-10',
  sectionStack: 'flex flex-col gap-8',
  stack: 'flex flex-col',
  row: 'flex items-center',
  between: 'flex items-center justify-between gap-4',
  center: 'flex items-center justify-center',
  grid: 'grid',
  divider: 'h-px w-full bg-border',
  dividerVertical: 'w-px self-stretch bg-border',
  srOnly: 'sr-only',
  // Slides over a pinned scene
  sheet: 'intro-sheet',
} as const

/**
 * Procedural page backdrop styles
 * @type {Object}
 */

export const TEXTURE_BACKDROP_STYLES = {
  frame: 'texture-frame',
} as const

/**
 * Button class generator
 * @param {Object} [options] - Requested appearance
 * @param {ButtonVariant} [options.variant] - Variant declared above
 * @param {Size} [options.size] - Size declared above
 * @param {boolean} [options.fullWidth] - Stretch flag
 * @return {string} - Class list
 */

export const buttonClass = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
}: { variant?: ButtonVariant; size?: Size; fullWidth?: boolean } = {}): string =>
  [BUTTON_BASE, BUTTON_SIZES[size], BUTTON_VARIANTS[variant], fullWidth ? 'w-full' : '']
    .filter(Boolean)
    .join(' ')

/**
 * Scroll-to-top button styles
 * @type {Object}
 */

export const SCROLL_TO_TOP_STYLES = {
  // Phone corner, centered on the plane rail from md
  button: `fixed right-4 hover:bg-transparent md:right-[26px] md:translate-x-1/2 ${TRANSITION_ALL}`,
  bottom: 'bottom-[max(1rem,env(safe-area-inset-bottom))] md:bottom-6',
  // Clear of the sticky action bar, when it is on
  raised: 'bottom-20 md:bottom-6',
  hidden: 'pointer-events-none translate-y-3 opacity-0',
} as const

/**
 * Sticky action bar styles
 * @type {Object}
 */

export const STICKY_ACTION_BAR_STYLES = {
  frame:
    'fixed inset-x-0 bottom-0 border-t border-border bg-background/95 p-3 backdrop-blur pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden',
} as const

/**
 * Consent trigger and dialog styles
 * @type {Object}
 */

export const CONSENT_STYLES = {
  // Bottom-left, clear of ScrollToTop which sits bottom-right
  trigger: `fixed left-4 flex h-12 w-12 items-center justify-center rounded-pill sm:left-8 sm:h-14 sm:w-14 ${TRANSITION_ALL} ${FOCUS_RING} hover:scale-105`,
  triggerBottom: 'bottom-[max(1rem,env(safe-area-inset-bottom))] sm:bottom-8',
  // Clear of the sticky action bar, when it is on
  triggerRaised: 'bottom-24 sm:bottom-8',
  triggerImage: 'h-full w-full object-contain drop-shadow-sm',
  body: 'flex flex-col gap-6',
  categories: 'flex flex-col divide-y divide-border border-y border-border',
  category: 'flex items-center gap-4 py-4',
  categoryIcon: `flex h-10 w-10 shrink-0 items-center justify-center rounded-pill ${TONE_SOFT.primary}`,
  categoryBody: 'flex flex-1 flex-col gap-1',
  categoryLabel: 'text-sm font-medium text-foreground',
  lock: 'text-xs uppercase tracking-wide text-primary',
} as const

/**
 * Appointment booking styles
 * @type {Object}
 */

export const BOOKING_STYLES = {
  // Capped width, so the calendar stays compact next to the wider slot grid
  frame: 'grid items-start gap-12 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]',
  calendar: 'flex flex-col gap-5',
  panel: `${SURFACES.card} p-5 sm:p-7`,
  monthBar: 'flex items-center justify-between gap-3 pb-6',
  monthLabel: 'font-display text-lg font-medium capitalize tracking-tight text-foreground',
  weekdays: 'grid grid-cols-7 gap-1 pb-3',
  weekday:
    'py-1 text-center text-[0.5625rem] font-medium uppercase tracking-[0.2em] text-foreground-subtle',
  days: 'grid grid-cols-7 gap-1',
  day: `flex aspect-square items-center justify-center rounded-sm text-sm tabular-nums text-foreground ${TRANSITION_ALL} ${FOCUS_RING} hover:bg-primary/20`,
  dayClosed: 'cursor-not-allowed text-foreground-subtle/35 hover:bg-transparent',
  daySelected: 'bg-primary text-primary-foreground hover:bg-primary',
  dayToday: 'ring-1 ring-inset ring-primary/50',
  // Cut board, zone in the top left tab
  board:
    'booking-board flex h-[31rem] flex-col bg-surface [clip-path:var(--shape-clip-compact)] sm:[clip-path:var(--shape-clip)]',
  tab: 'flex h-[var(--notch-top-compact)] shrink-0 items-center gap-3 px-5 sm:h-[var(--notch-top)] sm:w-[var(--notch-tab)] sm:px-6',
  tabIcon: 'booking-tick text-accent',
  tabLabel: 'text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-foreground-subtle',
  tabZone: 'text-sm font-medium text-foreground',
  content: 'flex min-h-0 flex-1 flex-col gap-5 px-5 pb-8 pt-5 sm:px-8 sm:pt-7',
  summary:
    'border-b border-border pb-4 font-display text-lg font-medium capitalize text-foreground',
  // Fewer, larger cells - a schedule grid, not a dense keypad
  slots:
    'grid min-h-0 grid-cols-3 content-start gap-3 overflow-y-auto p-1 transition-opacity duration-base [scrollbar-width:thin] sm:grid-cols-4',
  slot: `relative animate-bubble-in rounded-md border border-border py-3.5 text-center text-sm font-medium tabular-nums text-foreground ${TRANSITION_ALL} ${FOCUS_RING} hover:border-primary hover:text-primary`,
  // Pale gradient, dark ink in both themes
  confirmed:
    'flex animate-bubble-in items-start gap-4 rounded-lg bg-[linear-gradient(135deg,rgb(var(--color-sky-ink))_0%,rgb(var(--color-accent)/0.22)_65%,rgb(var(--color-accent)/0.4)_100%)] p-5 text-cover shadow-sm ring-1 ring-inset ring-white/40',
  confirmedIcon: 'mt-0.5 h-6 w-6 shrink-0 text-accent',
  confirmedTitle: 'font-display text-lg font-medium tracking-tight',
  confirmedText: 'text-sm leading-relaxed text-cover/75',
  slotsLoading: 'pointer-events-none opacity-50',
  // Soft tint, no full flood
  slotSelected: 'border-primary bg-primary/10 text-primary',
  // Left of the time, never shifts it
  slotCheck: 'absolute inset-y-0 left-3 my-auto animate-bubble-in',
  // Empty board, ghost cells
  ghost: 'h-[3.125rem] rounded-md border border-dashed border-border',
  hint: 'text-sm text-foreground-muted',
  // Form unfolds under the board
  reveal:
    'grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity] duration-slow ease-out data-[open=true]:grid-rows-[1fr] data-[open=true]:opacity-100',
  revealInner: 'flex min-h-0 flex-col gap-5 overflow-hidden',
  recap: 'flex items-center gap-3 pt-1 text-sm text-foreground-muted',
  recapValue: 'font-medium capitalize text-foreground',
} as const

/**
 * Before/after comparison carousel styles
 * @type {Object}
 */

export const COMPARISON_STYLES = {
  frame: 'flex flex-col gap-8',
  viewportWrapper: 'relative',
  // Padding shows a sliver of the next pair, so the eye anticipates it
  viewport:
    'flex snap-x snap-mandatory scroll-smooth overflow-x-auto px-[7%] [scrollbar-width:none] sm:px-[18%] [&::-webkit-scrollbar]:hidden',
  slide: 'w-[86%] shrink-0 snap-center px-1.5 sm:w-[64%]',
  card: `mx-auto max-w-4xl ${SURFACES.glass} p-6 sm:p-10 ${TRANSITION_ALL}`,
  // Only the centred pair reads at full scale
  cardActive: 'scale-100 opacity-100',
  cardInactive: 'scale-[0.94] opacity-55',
  pair: 'grid gap-5 sm:grid-cols-2 sm:gap-8',
  panel:
    'relative flex aspect-[3/4] items-center justify-center overflow-hidden rounded-lg border border-border bg-surface-strong',
  panelLabel:
    'absolute left-5 top-5 text-[0.5625rem] font-medium uppercase tracking-[0.3em] text-foreground-subtle',
  caption: 'mt-8 flex flex-col gap-3 border-t border-border pt-7',
  captionTitle: 'font-display text-xl font-medium text-foreground',
  controls: 'flex items-center justify-between gap-6',
  dots: 'flex flex-1 items-center gap-2.5',
  dot: `h-px flex-1 bg-border-strong ${TRANSITION_ALL} ${FOCUS_RING} rounded-pill hover:bg-primary/60`,
  dotActive: 'h-0.5 bg-primary',
  counter: 'text-[0.625rem] uppercase tracking-[0.28em] tabular-nums text-foreground-subtle',
  // Floats over the pair itself, not in the control row below
  arrow: `${SURFACES.glass} absolute top-1/2 z-10 -translate-y-1/2 rounded-pill text-primary hover:text-primary-hover ${TRANSITION_ALL}`,
  arrowLeft: 'left-2 sm:left-4',
  arrowRight: 'right-2 sm:right-4',
} as const

/**
 * Engraved globe styles
 * @type {Object}
 */

export const GLOBE_STYLES = {
  frame: 'relative aspect-square w-full',
  planet: 'pointer-events-none absolute inset-0 h-full w-full',
  // Horizontal drag only, vertical scroll stays native
  canvas:
    'absolute inset-0 h-full w-full cursor-grab touch-pan-y select-none active:cursor-grabbing',
} as const

/**
 * Starfield styles
 * @type {Object}
 */

export const STARFIELD_STYLES = {
  canvas: 'intro-layer h-full w-full',
} as const

/**
 * Landing scene styles
 * @type {Object}
 */

export const INTRO_STYLES = {
  track: 'intro-track',
  stage: 'intro-stage',
  runway: 'intro-runway',
  sky: 'intro-layer intro-sky',
  planet: 'intro-layer',
  globe: 'absolute inset-0 aspect-auto h-full',
  heading: 'absolute inset-x-0 top-[15svh] z-10 flex flex-col items-center gap-6 px-6 text-center',
  // Leaves upwards, the title stays for the navbar logo
  headingBody: 'intro-heading flex flex-col items-center gap-6',
  title: 'flex justify-center',
  // Invisible, the navbar logo flies from here
  logo: 'intro-hero-logo h-auto w-[min(82vw,34rem)]',
  // Weight sets the accent apart
  accent: 'font-semibold text-globe-air',
  subtitle: 'max-w-md text-sm leading-relaxed text-sky-ink/80 sm:text-base',
  cta: 'mt-1',
  // World caption, beside the planet
  beat: 'intro-beat intro-layer z-10 flex flex-col items-center justify-start px-6 pt-[16svh] text-center md:items-start md:justify-center md:px-[6vw] md:pt-0 md:text-left',
  beatTitle:
    'max-w-sm text-3xl font-medium leading-[1.05] tracking-[-0.03em] text-sky-ink md:max-w-[19rem] lg:text-[3rem]',
  // Free assessment box, first screen of the page
  dock: 'bilan-dock mx-auto w-[min(92vw,56rem)]',
  // Dims as the page covers it
  shade: 'intro-layer intro-shade',
} as const

/**
 * Story book section styles
 * @type {Object}
 */

export const STORY_STYLES = {
  // Sheet over the pinned scene
  section: 'py-16 sm:py-20',
  // Title lines step left, the description rides the second one
  head: 'flex flex-col gap-6 lg:grid lg:grid-cols-[17rem_auto_minmax(0,1fr)] lg:items-center lg:gap-y-1',
  intro:
    'max-w-xs text-sm leading-snug text-foreground-muted lg:col-start-1 lg:row-start-1 lg:pr-8',
  introStrong: 'font-semibold text-foreground',
  title: 'lg:contents',
  titleLead: 'block lg:col-span-2 lg:col-start-2 lg:row-start-1',
  titleTail: 'block lg:col-start-2 lg:row-start-2 lg:-ml-16',
  accent: 'text-accent',
  description:
    'max-w-xs text-sm leading-relaxed text-foreground-muted lg:col-start-3 lg:row-start-2 lg:pl-10',
  stage: 'mt-10 flex flex-col items-center gap-4 lg:mt-12',
  actions: 'flex flex-wrap justify-center gap-2',
  pills: 'flex w-full flex-wrap items-center justify-between gap-x-8 gap-y-4 lg:px-6',
  pill: 'flex items-center gap-3 text-xs leading-tight text-foreground-muted',
  faces: 'flex -space-x-2',
  face: 'ring-2 ring-background',
  flag: 'flex h-8 w-8 items-center justify-center rounded-pill bg-surface-strong text-base',
} as const

/**
 * Profile card styles
 * @type {Object}
 */

export const PROFILE_CARD_STYLES = {
  frame: 'relative w-36 [transform-style:preserve-3d]',
  front: 'relative [backface-visibility:hidden]',
  // Filter apart, it would defeat the backface
  shadow: 'drop-shadow-[0_14px_18px_rgb(var(--color-overlay)/0.16)]',
  cut: 'flex flex-col bg-surface [clip-path:var(--shape-clip)]',
  place:
    'flex h-[var(--notch-tab)] w-[var(--notch-tab-width)] items-center truncate pl-2.5 text-[0.5625rem] font-semibold uppercase tracking-[0.14em] text-foreground-muted',
  portrait:
    'mx-1 w-auto rounded-md [&_img]:transition-transform [&_img]:duration-slow group-hover/profile:[&_img]:scale-105',
  name: 'px-2.5 pt-2 text-xs font-semibold leading-tight text-foreground',
  role: 'flex h-[var(--notch-corner)] items-center pl-2.5 pr-[var(--notch-corner)] text-[0.6875rem] font-medium text-primary',
  flag: 'absolute bottom-0.5 right-0.5 flex h-[calc(var(--notch-corner)-0.25rem)] w-[calc(var(--notch-corner)-0.25rem)] items-center justify-center rounded-pill bg-surface text-sm shadow-md',
  // Brand side, seen mid spin
  back: 'absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]',
  backCut: 'flex h-full items-center justify-center bg-cover [clip-path:var(--shape-clip)]',
  symbol:
    'type-expanded flex h-11 w-11 items-center justify-center rounded-lg border-2 border-sky-ink/70 text-sm font-semibold text-sky-ink',
} as const

/**
 * Offers carousel styles
 * @type {Object}
 */

export const OFFER_STYLES = {
  // Heading kept for screen readers
  title: 'sr-only',
  // Room under the low cards
  viewport: 'pb-12',
  track: 'items-start',
  // Margin not gap, the half turn stays exact
  card: 'relative mr-4 w-56 shrink-0 rounded-[1.75rem] bg-overlay p-1 shadow-md sm:w-60',
  cardLow: 'mt-12',
  picture: 'rounded-[1.5rem]',
  // No backdrop blur, it would re-filter under the moving band
  label:
    'absolute inset-x-3.5 bottom-4 rounded-2xl bg-background/90 px-3 py-3 text-center text-sm text-foreground shadow-sm',
} as const

/**
 * Journey panel styles
 * @type {Object}
 */

export const JOURNEY_STYLES = {
  stage: 'relative flex flex-col gap-6',
  // Dark slab over the dimmed planet, kicker in the top tab
  panel:
    'relative bg-surface px-5 pb-10 [clip-path:var(--shape-clip-compact)] sm:px-8 lg:px-14 lg:pb-[calc(var(--notch-bottom)+4rem)] lg:[clip-path:var(--shape-clip)]',
  kicker:
    'flex h-[var(--notch-top-compact)] items-center text-xs font-semibold uppercase tracking-widest text-accent lg:h-[var(--notch-top)] lg:justify-center',
  head: 'mt-8 flex max-w-2xl flex-col items-start gap-4 lg:mx-auto lg:mt-6 lg:items-center lg:text-center',
  title: 'text-3xl font-medium tracking-tight text-foreground sm:text-4xl lg:text-[2.5rem]',
  accent: 'text-accent',
  description: 'text-sm leading-relaxed text-foreground-muted sm:text-base',
  // One column on a phone, zigzag rows of three on desktop
  trail: 'relative mt-12 lg:mt-16',
  route: 'grid gap-8 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-3 lg:gap-x-12 lg:gap-y-14 lg:pb-12',
  // Dashes between the numbers, phone column only
  thread: 'group-flow absolute bottom-24 left-10 top-8 w-px text-accent/60 sm:hidden',
  // Middle column flies lower
  step: 'relative pt-5 lg:[&:nth-child(3n+2)]:translate-y-12',
  // Dashes towards the next card in the row
  link: 'group-flow absolute left-full top-28 hidden h-px w-12 text-accent/60 lg:block lg:[li:nth-child(3n)>&]:hidden',
  // Uneven corners, like the other boxes
  card: 'relative flex h-full flex-col overflow-hidden rounded-[1.75rem_0.5rem_1.75rem_1.75rem] border border-border bg-background',
  media: 'relative',
  picture: 'bg-surface-strong',
  number:
    'absolute left-5 top-0 z-10 grid h-10 w-10 place-items-center rounded-pill bg-accent font-display text-base font-semibold tabular-nums text-accent-foreground ring-4 ring-surface',
  // Sits astride the photograph edge
  badge:
    'absolute -bottom-6 right-5 grid h-12 w-12 place-items-center rounded-pill bg-surface text-accent ring-1 ring-accent/50',
  body: 'flex flex-1 flex-col gap-3 p-5 pt-6',
  // Map lettering, like the engraved globe
  term: 'type-expanded pr-14 text-sm font-semibold uppercase tracking-[0.12em] text-foreground',
  definition: 'border-l-2 border-accent/70 pl-3 text-sm leading-relaxed text-foreground-muted',
  // Sits in the bottom left notch on desktop
  action:
    'flex flex-wrap items-center gap-x-5 gap-y-3 lg:absolute lg:bottom-0 lg:left-0 lg:h-[var(--notch-bottom)] lg:w-[var(--notch-left)] lg:flex-nowrap lg:pl-10',
  note: 'max-w-xs text-xs leading-snug text-foreground-muted',
} as const

/**
 * FAQ styles
 * @type {Object}
 */

export const FAQ_STYLES = {
  panel: 'rounded-[2rem] bg-surface p-6 sm:p-10 lg:p-14',
  grid: 'grid gap-10 lg:grid-cols-12 lg:gap-16',
  aside: 'flex flex-col items-start gap-5 lg:sticky lg:top-28 lg:col-span-4 lg:self-start',
  list: 'lg:col-span-8',
} as const

/**
 * Appointment and quote section styles
 * @type {Object}
 */

export const APPOINTMENT_STYLES = {
  section: 'pb-8',
  head: 'build-rise',
  calendar: 'build-rise [--build-step:1]',
  // Slides in beside the calendar
  board: 'build-slide [--build-step:2]',
} as const

/**
 * Opening hours card styles
 * @type {Object}
 */

export const SCHEDULE_STYLES = {
  card: 'flex flex-col gap-5 rounded-[1.75rem] border border-border bg-surface p-6 sm:p-8',
  head: 'flex flex-wrap items-center justify-between gap-3',
  title: 'font-display text-xl font-semibold tracking-[-0.02em] text-foreground',
  // Business time zone
  zone: 'type-expanded rounded-pill border border-border-strong px-3 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-foreground-muted',
  status: 'flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-foreground-muted',
  rows: 'flex flex-col divide-y divide-border border-y border-border',
  row: 'flex items-center justify-between gap-4 py-3 text-sm',
  day: 'capitalize text-foreground',
  hours: 'tabular-nums text-foreground-muted',
  note: 'text-xs text-foreground-muted',
} as const

/**
 * Calendar embed styles
 * @type {Object}
 */

export const CALENDLY_STYLES = {
  frame: 'h-[46rem] w-full overflow-hidden rounded-[2rem] border border-border bg-surface',
  facade: `${SURFACES.card} flex flex-col items-center gap-5 p-8 text-center sm:p-12`,
  notice: 'max-w-md text-sm leading-relaxed text-foreground-muted',
  actions: 'flex flex-wrap justify-center gap-3',
} as const

/**
 * Catalogue styles
 * @type {Object}
 */

export const CATALOG_STYLES = {
  stage: 'relative flex flex-col gap-6',
  // Night light table, clipped on desktop
  panel:
    'catalog-panel relative flex flex-col gap-12 overflow-hidden px-5 pb-12 pt-[calc(var(--notch-top-compact)+1.75rem)] text-foreground [clip-path:var(--shape-clip-compact)] sm:px-10 sm:pb-16 lg:px-14 lg:pb-[calc(var(--notch-bottom)+2rem)] lg:pt-8 lg:[clip-path:var(--shape-clip)]',
  head: 'grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-start',
  intro: 'flex flex-col gap-4',
  title:
    'max-w-xl text-4xl font-semibold leading-[1.02] tracking-[-0.035em] text-foreground sm:text-5xl lg:text-[3.5rem]',
  accent: 'text-accent',
  aside:
    'max-w-md text-sm leading-relaxed text-foreground-muted sm:text-base lg:pt-[var(--notch-top)]',
  // Sits in the bottom right notch on desktop
  actions:
    'flex flex-wrap gap-3 lg:absolute lg:bottom-0 lg:right-0 lg:h-[var(--notch-bottom)] lg:w-[var(--notch-cta)] lg:flex-nowrap lg:items-center lg:justify-end',
  hint: 'text-center text-xs text-foreground-subtle',
} as const

/**
 * Flippable catalogue styles
 * @type {Object}
 */

export const CATALOG_BOOK_STYLES = {
  layout: 'grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-center',
  chapters: 'flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0',
  chapter: `flex w-full items-center gap-3 whitespace-nowrap rounded-2xl border border-transparent px-3 py-2.5 text-left text-sm text-foreground-muted ${TRANSITION} ${FOCUS_RING} hover:bg-foreground/[0.06] hover:text-foreground`,
  chapterActive: 'border-border-strong bg-foreground/[0.08] text-foreground',
  chapterIndex: 'type-expanded text-[0.625rem] font-semibold tabular-nums text-accent',
  chapterLabel: 'min-w-0 truncate',
  chapterPages: 'ml-auto shrink-0 pl-3 text-xs tabular-nums text-foreground-subtle',
  stage: 'relative flex justify-center overflow-x-clip [perspective:2200px] lg:row-span-2',
  // Contact shadow on the table
  table:
    'pointer-events-none absolute inset-x-[8%] -bottom-5 h-12 rounded-[50%] bg-black/60 blur-2xl',
  // Empty areas of the shifted box let clicks through
  book: `pointer-events-none relative w-full max-w-[56rem] rounded-sm [transform-style:preserve-3d] ${FOCUS_RING}`,
  // Right half, hinged on the spine
  hinge: 'absolute inset-y-0 left-1/2 w-1/2 [transform-style:preserve-3d]',
  // Far leaves leave the 3D sorting
  hingeFar: 'invisible',
  leaf: 'absolute inset-0 origin-left [transform-style:preserve-3d]',
  face: 'absolute inset-0 overflow-hidden bg-white [backface-visibility:hidden] shadow-[0_30px_60px_-30px_rgb(0_0_0/0.8)]',
  front: 'rounded-r-md',
  back: 'rounded-l-md [transform:rotateY(180deg)]',
  picture: 'object-cover',
  // Page left for the binding, logo on the night sky
  blank:
    'flex h-full w-full items-center justify-center bg-gradient-to-b from-sky-top to-sky-bottom p-[18%] ring-1 ring-inset ring-foreground/10',
  blankLogo: 'h-auto w-full',
  // Paper curving into the binding
  spineRight:
    'pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-black/25 to-transparent',
  spineLeft:
    'pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-black/25 to-transparent',
  shade: 'pointer-events-none absolute inset-0 bg-black',
  // Above every leaf, even lifted
  hitLeft:
    'pointer-events-auto absolute inset-y-0 left-0 w-1/2 cursor-w-resize [transform:translateZ(80px)]',
  hitRight:
    'pointer-events-auto absolute inset-y-0 right-0 w-1/2 cursor-e-resize [transform:translateZ(80px)]',
  controls: 'flex items-center justify-center gap-4 lg:col-start-2',
  meter: 'flex min-w-44 flex-col items-center gap-2',
  counter: 'text-center text-sm tabular-nums text-foreground-muted',
  track: 'h-1 w-full overflow-hidden rounded-pill bg-foreground/10',
  progress: 'block h-full rounded-pill bg-accent transition-[width] duration-slow ease-out',
} as const

/**
 * Group section styles
 * @type {Object}
 */

export const GROUP_STYLES = {
  stage: 'relative',
  // Cut slab on desktop, soon line in the notch
  panel:
    'relative flex flex-col gap-12 overflow-hidden bg-surface px-6 pb-12 pt-[calc(var(--notch-top-compact)+1.75rem)] [clip-path:var(--shape-clip-compact)] sm:px-10 lg:px-14 lg:pb-[calc(var(--notch-bottom)+3rem)] lg:pt-[calc(var(--notch-top)+2rem)] lg:[clip-path:var(--shape-clip)]',
  // Top right, on the raised half
  head: 'flex max-w-2xl flex-col items-start gap-4 lg:absolute lg:right-0 lg:top-0 lg:h-[var(--notch-top)] lg:w-1/2 lg:max-w-none lg:justify-center lg:px-14',
  title: 'text-3xl font-medium tracking-tight text-foreground sm:text-4xl lg:text-[2.5rem]',
  accent: 'text-accent',
  description: 'text-sm leading-relaxed text-foreground-muted',
  // Card, link, hub, link, card
  network:
    'flex flex-col items-center lg:grid lg:grid-cols-[1fr_4rem_auto_4rem_1fr] lg:items-center',
  // Uneven corners, like the other boxes
  card: 'flex w-full max-w-sm flex-col items-start gap-3 rounded-[1.75rem_0.5rem_1.75rem_1.75rem] border border-border bg-background p-6 lg:max-w-none',
  cardMirror: 'rounded-[0.5rem_1.75rem_1.75rem_1.75rem]',
  cardCurrent: 'border-accent/40',
  cardTag: 'text-xs font-semibold uppercase tracking-[0.14em] text-accent',
  cardTitle: 'text-xl font-semibold text-foreground',
  cardText: 'text-sm leading-relaxed text-foreground-muted',
  here: 'inline-flex items-center gap-2 text-sm font-medium text-foreground before:h-2 before:w-2 before:rounded-full before:bg-accent',
  // Dashes travelling towards the hub
  link: 'group-flow h-12 text-accent w-px self-center lg:h-px lg:w-full',
  linkReverse: 'group-flow-reverse',
  hub: 'relative grid h-56 w-56 shrink-0 place-items-center sm:h-64 sm:w-64',
  ring: 'absolute inset-6 rounded-full border border-accent/50',
  orbit: 'absolute inset-0 rounded-full border border-dashed border-border-strong',
  orbitInner: 'absolute inset-10 rounded-full border border-border',
  satellite:
    'absolute left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-accent ring-4 ring-accent/15 first:-translate-y-1/2 last:translate-y-1/2',
  satelliteSoon:
    'absolute left-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-foreground-muted bg-surface',
  core: 'relative flex h-28 w-28 flex-col items-center justify-center gap-1 rounded-full bg-foreground text-center sm:h-32 sm:w-32',
  coreName: 'px-3 text-base font-semibold leading-tight text-background',
  coreHint: 'text-[0.65rem] uppercase tracking-[0.16em] text-background/60',
  soon: 'mt-6 flex items-center justify-center gap-3 text-sm text-foreground-muted lg:absolute lg:bottom-0 lg:left-0 lg:mt-0 lg:h-[var(--notch-bottom)] lg:w-[var(--notch-soon)] lg:justify-start lg:pl-2',
  soonDot: 'h-2 w-2 rounded-full bg-accent',
} as const

/**
 * Scroll plane styles
 * @type {Object}
 */

export const SCROLL_PLANE_STYLES = {
  // Always shown, visible track
  // Desktop only, a phone keeps its own scroll indicator
  rail: 'pointer-events-none fixed inset-y-24 right-4 z-[90] hidden w-5 transition-[opacity,visibility] duration-slow md:block',
  // Waits for the landing animation
  hidden: 'invisible opacity-0',
  track:
    'absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 rounded-full bg-white/40 mix-blend-difference',
  progress: 'absolute left-1/2 top-0 w-0.5 -translate-x-1/2 rounded-full bg-accent',
  plane:
    'pointer-events-auto absolute left-0 h-5 w-5 cursor-grab touch-none select-none drop-shadow-[0_3px_4px_rgb(0_0_0/0.35)] transition-[rotate] duration-300 active:cursor-grabbing',
} as const

/**
 * Flight scene styles
 * @type {Object}
 */

export const FLIGHT_STYLES = {
  plane: 'absolute inset-0 z-20 h-full w-full pointer-events-none',
  // Flat fallback, moved by transform
  glyph: 'absolute left-0 top-0 z-20 drop-shadow-[0_6px_10px_rgb(0_0_0/0.35)]',
  trail: 'absolute inset-0 z-[15] h-full w-full pointer-events-none',
  trailLine: 'fill-none stroke-sky-ink/35 [stroke-linecap:round] [stroke-width:3]',
} as const

/**
 * Free assessment panel styles
 * @type {Object}
 */

export const BILAN_STYLES = {
  frame: 'w-full',
  // Dark slab, kicker in the top tab: left tab on a phone, centred tab above
  body: 'intro-box-body flex flex-col items-start gap-4 bg-cover px-5 pb-6 text-left [clip-path:var(--shape-clip-compact)] sm:items-center sm:gap-5 sm:px-12 sm:pb-12 sm:text-center sm:[clip-path:var(--shape-clip)]',
  kicker:
    'flex h-[var(--notch-top-compact)] items-center text-xs font-semibold uppercase tracking-widest text-accent sm:h-[var(--notch-top)]',
  title: 'max-w-xl text-3xl font-medium tracking-tight text-sky-ink sm:text-4xl lg:text-5xl',
  description: 'max-w-lg text-sm leading-relaxed text-sky-ink/75 sm:text-base',
  // Stacked full width under the thumb, one row above
  channels:
    'mt-2 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-center [&>*]:w-full sm:[&>*]:w-auto',
} as const

/**
 * Error page styles
 * @type {Object}
 */

export const ERROR_STYLES = {
  frame: 'flex flex-col items-center gap-6 text-center',
  figure: 'w-full max-w-xs text-primary',
  route:
    'fill-none stroke-current opacity-40 [stroke-dasharray:4_6] [stroke-linecap:round] [stroke-width:2]',
  break: 'fill-none stroke-current [stroke-linecap:round] [stroke-width:2]',
  plane: 'animate-drift motion-reduce:animate-none',
  kicker: 'text-xs font-semibold uppercase tracking-[0.18em] text-primary',
  title: 'text-3xl font-medium tracking-[-0.02em] text-foreground sm:text-4xl',
  text: 'max-w-md text-base leading-relaxed text-foreground-subtle',
  actions: 'mt-2 flex flex-wrap items-center justify-center gap-3',
} as const

/**
 * Presentation section styles
 * @type {Object}
 */

export const PRESENTATION_STYLES = {
  grid: 'grid gap-14 md:grid-cols-2 md:gap-16',
  member: 'flex flex-col items-center gap-6 text-center',
  card: 'w-56 sm:w-64',
  tags: 'flex flex-wrap justify-center gap-2',
  tag: 'rounded-pill bg-surface px-3 py-1 text-xs font-medium text-foreground-muted',
} as const
