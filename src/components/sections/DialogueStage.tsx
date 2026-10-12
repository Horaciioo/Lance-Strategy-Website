'use client'

import { Fragment, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useTranslations } from 'next-intl'

import { Avatar } from '@/components/elements/data/Avatar'
import { Icon } from '@/components/elements/media/Icon'
import type { IconName } from '@/declarations/ui/icons'
import { DIALOGUE_STYLES } from '@/declarations/ui/variants'
import { ConfigurationService } from '@/services/ConfigurationService'
import { ViewportService } from '@/services/ViewportService'

const { dialogueTypingMs, dialogueReadMs, dialogueRestMs } = ConfigurationService.timings

// Typing dots, offset bounces
const DOT_DELAYS_MS = [0, 150, 300]

/**
 * Message author
 * @typedef DialogueAuthor
 */

export interface DialogueAuthor {
  name: string
  role: string
  portrait: string | null
  isClient: boolean
}

/**
 * Rendered line
 * @typedef DialogueEntry
 */

export interface DialogueEntry {
  id: string
  text: string
  author: DialogueAuthor
  // Separator when a step opens
  step: string | null
  attachment: { label: string; icon: IconName } | null
}

export interface DialogueStageProps {
  lines: DialogueEntry[]
  header: ReactNode
  footer: ReactNode
}

// Next state of the loop
const nextOf = (state: { count: number; isTyping: boolean }, total: number) => {
  if (state.count >= total) return { next: { count: 0, isTyping: true }, delayMs: dialogueRestMs }
  if (state.isTyping)
    return { next: { count: state.count + 1, isTyping: false }, delayMs: dialogueTypingMs }

  return { next: { count: state.count, isTyping: true }, delayMs: dialogueReadMs }
}

/**
 * Animated conversation window
 * @param {DialogueStageProps} props - Stage props
 * @return {JSX.Element} - Rendered window
 */

export const DialogueStage = ({ lines, header, footer }: DialogueStageProps) => {
  const t = useTranslations('sections.dialogue')
  const windowRef = useRef<HTMLDivElement>(null)
  const isStill = ViewportService.usePrefers('reducedMotion')
  const [isSeen, setIsSeen] = useState(false)
  const [state, setState] = useState({ count: 0, isTyping: true })
  const count = isStill ? lines.length : state.count
  const isTyping = !isStill && state.isTyping && count < lines.length
  const shown = lines.slice(0, isTyping ? count + 1 : count)

  // Starts once on screen
  useEffect(() => {
    const target = windowRef.current
    if (!target || isSeen) return undefined
    const watching = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) setIsSeen(true)
    })
    watching.observe(target)

    return () => watching.disconnect()
  }, [isSeen])

  // Type, read, then loop
  useEffect(() => {
    if (isStill || !isSeen) return undefined
    const { next, delayMs } = nextOf(state, lines.length)
    const timer = setTimeout(() => setState(next), delayMs)

    return () => clearTimeout(timer)
  }, [state, lines.length, isStill, isSeen])

  return (
    <div className={DIALOGUE_STYLES.stage}>
      <div ref={windowRef} data-scheme="dark" className={DIALOGUE_STYLES.window}>
        {header}
        <div aria-live="polite" className={DIALOGUE_STYLES.thread}>
          {shown.map((line, index) => {
            const isPending = isTyping && index === count

            return (
              <Fragment key={line.id}>
                {line.step && <p className={DIALOGUE_STYLES.separator}>{line.step}</p>}
                <div className={DIALOGUE_STYLES.line}>
                  <Avatar name={line.author.name} src={line.author.portrait} size="sm" />
                  <div className={DIALOGUE_STYLES.message}>
                    <p className={DIALOGUE_STYLES.author}>
                      <span
                        className={
                          line.author.isClient ? DIALOGUE_STYLES.name : DIALOGUE_STYLES.nameTeam
                        }>
                        {line.author.name}
                      </span>
                      {!line.author.isClient && (
                        <span className={DIALOGUE_STYLES.role}>{line.author.role}</span>
                      )}
                    </p>
                    {isPending ? (
                      <span
                        className={DIALOGUE_STYLES.typing}
                        role="status"
                        aria-label={t('typing', {
                          name: line.author.name,
                          speaker: line.author.isClient ? 'client' : 'team',
                        })}>
                        {DOT_DELAYS_MS.map((delayMs) => (
                          <span
                            key={delayMs}
                            style={{ animationDelay: `${delayMs}ms` }}
                            className={DIALOGUE_STYLES.dot}
                          />
                        ))}
                      </span>
                    ) : (
                      <>
                        <p className={DIALOGUE_STYLES.text}>{line.text}</p>
                        {line.attachment && (
                          <span className={DIALOGUE_STYLES.attachment}>
                            <span className={DIALOGUE_STYLES.attachmentIcon}>
                              <Icon name={line.attachment.icon} size="sm" />
                            </span>
                            {line.attachment.label}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </Fragment>
            )
          })}
        </div>
      </div>
      {footer}
    </div>
  )
}
