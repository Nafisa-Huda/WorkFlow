import type { FieldValues, Path, UseFormReturn } from 'react-hook-form'
import { ApiError } from './api'

/** Puts server-side validation errors next to the matching inputs, or on the form as a whole. */
export function applyServerErrors<T extends FieldValues, TOutput extends FieldValues = T>(
  form: UseFormReturn<T, unknown, TOutput>,
  error: Error,
) {
  const fields = error instanceof ApiError ? error.fields : undefined
  if (fields && Object.keys(fields).length) {
    for (const [name, messages] of Object.entries(fields)) {
      form.setError(name as Path<T>, { message: messages?.[0] })
    }
  } else {
    form.setError('root', { message: error.message })
  }
}
