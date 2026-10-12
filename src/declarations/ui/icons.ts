import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Ban,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Filter,
  Globe,
  Handshake,
  Heart,
  Home,
  Images,
  Inbox,
  Info,
  Languages,
  Loader2,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  PencilRuler,
  Monitor,
  Cpu,
  Package,
  Scissors,
  Shirt,
  Smartphone,
  Moon,
  Phone,
  Quote,
  Scale,
  Search,
  SearchX,
  Send,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  Tag,
  Trash2,
  TrendingUp,
  Upload,
  User,
  Users,
  X,
  Zap,
} from 'lucide-react'

import {
  FacebookGlyph,
  GithubGlyph,
  InstagramGlyph,
  LinkedinGlyph,
  XGlyph,
  YoutubeGlyph,
} from '@/declarations/ui/brandGlyphs'
import type { IconComponent } from '@/declarations/ui/brandGlyphs'

/**
 * Icon registry
 * @type {Object}
 */

export const ICONS = {
  home: Home,
  menu: Menu,
  close: X,
  check: Check,
  search: Search,
  searchEmpty: SearchX,
  filter: Filter,
  inbox: Inbox,
  copy: Copy,
  download: Download,
  upload: Upload,
  file: FileText,
  photos: Images,
  delete: Trash2,
  send: Send,
  quote: Quote,
  star: Star,
  heart: Heart,
  sparkles: Sparkles,
  zap: Zap,
  trend: TrendingUp,
  users: Users,
  user: User,
  tag: Tag,
  scale: Scale,
  shield: Shield,
  shieldCheck: ShieldCheck,
  handshake: Handshake,
  pencilRuler: PencilRuler,
  globe: Globe,
  language: Languages,
  calendar: Calendar,
  clock: Clock,
  mail: Mail,
  chat: MessageCircle,
  external: ExternalLink,
  shirt: Shirt,
  smartphone: Smartphone,
  cpu: Cpu,
  package: Package,
  scissors: Scissors,
  phone: Phone,
  location: MapPin,
  spinner: Loader2,
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: Ban,
  arrowLeft: ArrowLeft,
  arrowRight: ArrowRight,
  arrowUp: ArrowUp,
  chevronDown: ChevronDown,
  chevronUp: ChevronUp,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  themeLight: Sun,
  themeDark: Moon,
  themeSystem: Monitor,
  instagram: InstagramGlyph,
  linkedin: LinkedinGlyph,
  facebook: FacebookGlyph,
  youtube: YoutubeGlyph,
  github: GithubGlyph,
  x: XGlyph,
} as const satisfies Record<string, IconComponent>

/**
 * Icon name
 * @typedef {keyof typeof ICONS} IconName
 */

export type IconName = keyof typeof ICONS

/**
 * Icon pixel sizes
 * @type {Object}
 */

export const ICON_SIZES = {
  xs: 'h-3.5 w-3.5',
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
  xl: 'h-8 w-8',
} as const

/**
 * Icon size name
 * @typedef {keyof typeof ICON_SIZES} IconSize
 */

export type IconSize = keyof typeof ICON_SIZES
