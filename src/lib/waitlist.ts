'use server'

export type WaitlistField = 'name' | 'email'

export type WaitlistState =
  | { status: 'idle' }
  | {
      status: 'error'
      field: WaitlistField
      message: string
      /** What was submitted, so the form can put it back after React resets it. */
      values: Record<WaitlistField, string>
    }
  | { status: 'success'; email: string }

const MAX_NAME_LENGTH = 100
const MAX_EMAIL_LENGTH = 254

/** Stricter than `type="email"`, which accepts dotless domains like `ada@gmail`. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function readField(formData: FormData, field: WaitlistField) {
  const value = formData.get(field)
  return typeof value === 'string' ? value.trim() : ''
}

function validate(values: Record<WaitlistField, string>) {
  if (!values.name) {
    return { field: 'name', message: 'Please enter your name.' } as const
  }
  if (values.name.length > MAX_NAME_LENGTH) {
    return {
      field: 'name',
      message: `Please keep your name under ${MAX_NAME_LENGTH} characters.`,
    } as const
  }
  if (values.email.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(values.email)) {
    return { field: 'email', message: 'Please enter a valid email address.' } as const
  }
  return null
}

/**
 * Adds a visitor to the launch waitlist. The hero form calls this through
 * `useActionState`, so signups work even before the page hydrates.
 */
export async function joinWaitlist(
  _previous: WaitlistState,
  formData: FormData,
): Promise<WaitlistState> {
  const values = {
    name: readField(formData, 'name'),
    email: readField(formData, 'email'),
  }

  const error = validate(values)
  if (error) return { status: 'error', ...error, values }

  // TODO: persist the signup (Firestore, the API server, or a mailing-list
  // provider). Until then it only reaches the server log.
  console.info('[waitlist] new signup', values)

  return { status: 'success', email: values.email }
}
