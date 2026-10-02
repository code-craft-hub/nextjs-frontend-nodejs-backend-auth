'use client'

import { ArrowRight, CircleCheck } from 'lucide-react'
import { useActionState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { joinWaitlist, type WaitlistState } from '@/lib/waitlist'

/** Target of in-page links to the form, such as the header CTA. */
export const WAITLIST_ID = 'waitlist'
/** The first field — the header CTA puts the cursor here. */
export const WAITLIST_NAME_INPUT_ID = 'waitlist-name'

const EMAIL_INPUT_ID = 'waitlist-email'
const ERROR_ID = 'waitlist-error'
const INITIAL_STATE: WaitlistState = { status: 'idle' }

/**
 * Below `sm` each field is its own pill; from `sm` up both fields sit inside
 * the form's white pill, which carries the border and focus ring instead.
 * `text-base` keeps iOS from zooming in on focus.
 */
const fieldClass =
  'h-12 w-full min-w-0 rounded-full bg-card px-5 text-base text-foreground ring-1 ring-foreground/10 outline-none transition-shadow placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/40 aria-invalid:ring-destructive/60 sm:h-11 sm:flex-1 sm:bg-transparent sm:px-4 sm:ring-0 sm:focus-visible:ring-0'

/**
 * The hero's waitlist signup. A successful signup swaps the form for a
 * confirmation.
 */
export function WaitlistForm({ className }: { className?: string }) {
  const [state, formAction, isPending] = useActionState(
    joinWaitlist,
    INITIAL_STATE,
  )
  const nameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const confirmationRef = useRef<HTMLParagraphElement>(null)

  // Focus was on a submit button that is now disabled or gone, so move it to
  // the result: the field to fix, or the confirmation.
  useEffect(() => {
    if (state.status === 'success') {
      confirmationRef.current?.focus()
    } else if (state.status === 'error') {
      const fieldRef = state.field === 'name' ? nameRef : emailRef
      fieldRef.current?.focus()
    }
  }, [state])

  const error = state.status === 'error' ? state : null

  return (
    <div id={WAITLIST_ID} className={cn('w-full max-w-xl', className)}>
      {state.status === 'success' ? (
        <p
          ref={confirmationRef}
          tabIndex={-1}
          className="flex min-h-14 items-center justify-center gap-2.5 rounded-3xl bg-card px-6 py-3 text-[0.95rem] text-foreground shadow-lg shadow-primary/5 ring-1 ring-foreground/10 outline-none"
        >
          <CircleCheck
            aria-hidden="true"
            className="size-5 shrink-0 text-emerald-600"
          />
          <span>
            You&apos;re on the list. We&apos;ll email{' '}
            <span className="font-medium break-all">{state.email}</span> when
            Cver AI opens.
          </span>
        </p>
      ) : (
        <form
          action={formAction}
          aria-label="Join the waitlist"
          className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-0 sm:rounded-full sm:bg-card sm:p-1.5 sm:shadow-lg sm:shadow-primary/5 sm:ring-1 sm:ring-foreground/10 sm:transition-shadow sm:focus-within:ring-2 sm:focus-within:ring-primary/40"
        >
          <label htmlFor={WAITLIST_NAME_INPUT_ID} className="sr-only">
            Name
          </label>
          <input
            ref={nameRef}
            id={WAITLIST_NAME_INPUT_ID}
            name="name"
            type="text"
            autoComplete="name"
            required
            placeholder="Your name"
            defaultValue={error?.values.name}
            aria-invalid={error?.field === 'name' || undefined}
            aria-describedby={error?.field === 'name' ? ERROR_ID : undefined}
            className={fieldClass}
          />

          <span
            aria-hidden="true"
            className="hidden h-6 w-px shrink-0 bg-border sm:block"
          />

          <label htmlFor={EMAIL_INPUT_ID} className="sr-only">
            Email address
          </label>
          <input
            ref={emailRef}
            id={EMAIL_INPUT_ID}
            name="email"
            type="email"
            autoComplete="email"
            spellCheck={false}
            required
            placeholder="Email address"
            defaultValue={error?.values.email}
            aria-invalid={error?.field === 'email' || undefined}
            aria-describedby={error?.field === 'email' ? ERROR_ID : undefined}
            className={fieldClass}
          />

          <Button
            type="submit"
            size="lg"
            disabled={isPending}
            className="h-12 shrink-0 rounded-full px-6 text-base transition-transform duration-300 hover:scale-[1.03] sm:ml-1.5 sm:h-11"
          >
            {isPending ? 'Joining…' : 'Join waitlist'}
            <ArrowRight data-icon="inline-end" />
          </Button>
        </form>
      )}

      {error && (
        <p id={ERROR_ID} role="alert" className="mt-2.5 text-sm text-destructive">
          {error.message}
        </p>
      )}
    </div>
  )
}
