'use client'

import { ArrowRight, CircleCheck } from 'lucide-react'
import {
  WAITLIST_FORM_ID,
  useWaitlist,
} from '@/components/landing/WaitlistProvider'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/** The white pill core inside the ring, shared by the button and its joined state. */
const coreClass =
  'relative h-10 w-full rounded-xl border-transparent bg-card px-4 font-bold text-foreground shadow-none! drop-shadow-none hover:bg-card hover:text-foreground'

/**
 * The marketing header CTA — a white pill wrapped in the animated For-you
 * aurora ring. It submits the hero's waitlist form through the `form`
 * attribute, so it validates, submits and shows progress exactly like the
 * form's own button. Once joined it turns into a confirmation.
 */
export function JoinWaitlistButton({ className }: { className?: string }) {
  const { state, isPending } = useWaitlist()

  return (
    <div className={cn('relative inline-flex h-10 shrink-0', className)}>
      <span
        aria-hidden="true"
        className="live-feed-ring live-feed-ring-glow pointer-events-none absolute -inset-0.5 rounded-[0.875rem]"
      />
      <span
        aria-hidden="true"
        className="live-feed-ring pointer-events-none absolute -inset-0.5 rounded-[0.875rem]"
      />

      {state.status === 'success' ? (
        <span
          className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), coreClass)}
        >
          You&apos;re on the list
          <CircleCheck data-icon="inline-end" className="text-emerald-600" />
        </span>
      ) : (
        <Button
          type="submit"
          form={WAITLIST_FORM_ID}
          disabled={isPending}
          size="sm"
          variant="ghost"
          // A faded core would let the ring show through, so pending greys
          // the label instead.
          className={cn(
            coreClass,
            'disabled:text-muted-foreground disabled:opacity-100',
          )}
        >
          {isPending ? 'Joining…' : 'Join waitlist'}
          <ArrowRight data-icon="inline-end" />
        </Button>
      )}
    </div>
  )
}
