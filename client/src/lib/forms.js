import { ApiError } from './api'

/** Puts server-side validation errors next to the matching inputs, or on the form as a whole. */
export function applyServerErrors(form, error) {
  const fields = error instanceof ApiError ? error.fields : undefined
  if (fields && Object.keys(fields).length) {
    for (const [name, messages] of Object.entries(fields)) {
      form.setError(name, { message: messages?.[0] })
    }
  } else {
    form.setError('root', { message: error.message })
  }
}
