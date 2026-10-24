import Image from 'next/image'
import type { CSSProperties, Ref } from 'react'

import { LOGO_STYLES } from '@/declarations/ui/variants'
import { ConfigurationService } from '@/services/ConfigurationService'
import type { Styleable } from '@/types/common'
import { cn } from '@/utils/classnames'

export interface LogoProps extends Styleable {
  imageRef?: Ref<HTMLImageElement>
  // Chip backdrop opacity
  backdrop?: number
  // Bare image, no chip
  isFlat?: boolean
  imageStyle?: CSSProperties
  imageClassName?: string
}

const { name } = ConfigurationService.site
const { wordmark } = ConfigurationService.site.logo

/**
 * Site logo
 * @param {LogoProps} props - Logo props
 * @return {JSX.Element} - Rendered logo
 */

export const Logo = ({
  imageRef,
  backdrop = 1,
  isFlat = false,
  imageStyle,
  imageClassName,
  className,
}: LogoProps) => (
  <span className={cn(isFlat ? LOGO_STYLES.flat : LOGO_STYLES.chip, className)}>
    {!isFlat && (
      <span aria-hidden="true" className={LOGO_STYLES.backdrop} style={{ opacity: backdrop }} />
    )}
    <Image
      ref={imageRef}
      src={wordmark.src}
      alt={name}
      width={wordmark.width}
      height={wordmark.height}
      unoptimized
      style={imageStyle}
      className={cn(LOGO_STYLES.image, imageClassName)}
    />
  </span>
)
