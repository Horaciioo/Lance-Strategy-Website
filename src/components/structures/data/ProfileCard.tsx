import type { CSSProperties } from 'react'

import { Picture } from '@/components/elements/media/Picture'
import { PROFILE_CARD_VARIABLES } from '@/declarations/ui/shapes'
import { PROFILE_CARD_STYLES } from '@/declarations/ui/variants'
import type { Styleable } from '@/types/common'
import { cn } from '@/utils/classnames'

// Portrait width hint
const PORTRAIT_SIZES = '9rem'

export interface ProfileCardProps extends Styleable {
  name: string
  role: string
  // City tab
  place: string
  // Emoji flag
  flag: string
  portrait: string
  portraitAlt: string
  // Back face mark
  symbol: string
  style?: CSSProperties
}

/**
 * Cut two-sided profile card
 * @param {ProfileCardProps} props - Profile card props
 * @return {JSX.Element} - Rendered card
 */

export const ProfileCard = ({
  name,
  role,
  place,
  flag,
  portrait,
  portraitAlt,
  symbol,
  style,
  className,
}: ProfileCardProps) => (
  <article
    style={{ ...PROFILE_CARD_VARIABLES, ...style } as CSSProperties}
    className={cn(PROFILE_CARD_STYLES.frame, className)}>
    <div className={PROFILE_CARD_STYLES.front}>
      <div className={PROFILE_CARD_STYLES.shadow}>
        <div className={PROFILE_CARD_STYLES.cut}>
          <p className={PROFILE_CARD_STYLES.place}>{place}</p>
          <Picture
            src={portrait}
            alt={portraitAlt}
            ratio="square"
            sizes={PORTRAIT_SIZES}
            className={PROFILE_CARD_STYLES.portrait}
          />
          <h3 className={PROFILE_CARD_STYLES.name}>{name}</h3>
          {/* Beside the flag notch */}
          <p className={PROFILE_CARD_STYLES.role}>{role}</p>
        </div>
      </div>
      <span aria-hidden="true" className={PROFILE_CARD_STYLES.flag}>
        {flag}
      </span>
    </div>
    <div aria-hidden="true" className={PROFILE_CARD_STYLES.back}>
      <div className={PROFILE_CARD_STYLES.backCut}>
        <span className={PROFILE_CARD_STYLES.symbol}>{symbol}</span>
      </div>
    </div>
  </article>
)
