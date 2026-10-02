'use client'

import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from 'motion/react'
import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { cn } from '@/lib/utils'

export interface SwipeCardDeckItem {
  id: string
  label: string
  content: ReactNode
}

interface SwipeCardDeckProps {
  items: SwipeCardDeckItem[]
  ariaLabel: string
  className?: string
}

const VISIBLE_CARD_COUNT = 4
const AUTO_SWIPE_DELAY = 4600
const LAYER_STATES = [
  { y: 26, scale: 1, opacity: 1 },
  { y: 9, scale: 0.975, opacity: 0.74 },
  { y: -8, scale: 0.95, opacity: 0.48 },
  { y: -25, scale: 0.925, opacity: 0.26 },
] as const

export function SwipeCardDeck({
  items,
  ariaLabel,
  className,
}: SwipeCardDeckProps) {
  const reduceMotion = useReducedMotion()
  const [activeIndex, setActiveIndex] = useState(0)

  const visibleItems = useMemo(
    () =>
      Array.from(
        { length: Math.min(VISIBLE_CARD_COUNT, items.length) },
        (_, depth) => ({
          item:
            items[
              (activeIndex - depth + items.length) % items.length
            ],
          depth,
        }),
      ),
    [activeIndex, items],
  )

  useEffect(() => {
    if (items.length < 2) return

    const timer = window.setInterval(
      () => setActiveIndex((current) => (current + 1) % items.length),
      AUTO_SWIPE_DELAY,
    )

    return () => window.clearInterval(timer)
  }, [items.length])

  if (items.length === 0) return null

  const activePosition = (activeIndex % items.length) + 1

  return (
    <div
      role="region"
      aria-label={ariaLabel}
      aria-roledescription="automatic card deck"
      className={cn('flex items-center justify-center', className)}
    >
      <div className="relative h-72 w-[calc(100vw-3rem)] max-w-sm shrink-0 sm:h-72 sm:max-w-lg">
        <AnimatePresence initial={false}>
          {[...visibleItems].reverse().map(({ item, depth }) => {
            const layer = LAYER_STATES[depth]
            const isActive = depth === 0

            return (
              <motion.div
                key={item.id}
                initial={
                  reduceMotion
                    ? { opacity: 0 }
                    : { y: 230, scale: 0.985, opacity: 0 }
                }
                animate={{
                  y: layer.y,
                  scale: layer.scale,
                  opacity: layer.opacity,
                }}
                exit={
                  reduceMotion
                    ? { opacity: 0 }
                    : {
                        y: -52,
                        scale: 0.9,
                        opacity: 0,
                      }
                }
                transition={{
                  duration: reduceMotion ? 0.2 : 0.72,
                  ease: [0.22, 1, 0.36, 1],
                }}
                role={isActive ? 'group' : undefined}
                aria-label={isActive ? item.label : undefined}
                aria-hidden={isActive ? undefined : true}
                className={cn(
                  'absolute inset-x-0 top-0 select-none',
                  isActive
                    ? 'landing-deck-card-active z-10'
                    : 'landing-deck-card-history pointer-events-none grayscale',
                )}
                style={{
                  zIndex: VISIBLE_CARD_COUNT - depth,
                  transformOrigin: 'bottom center',
                }}
              >
                {item.content}
                {!isActive && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 rounded-3xl bg-muted/55"
                    style={{
                      maskImage:
                        'linear-gradient(to bottom, black 0%, black 38%, transparent 92%)',
                    }}
                  />
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      <p className="sr-only" aria-live="polite">
        {items[activeIndex % items.length]?.label}. Card {activePosition} of{' '}
        {items.length}. Cards advance automatically.
      </p>
    </div>
  )
}
