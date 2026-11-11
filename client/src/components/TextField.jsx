import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

/** Labelled input wired to react-hook-form, with accessible error messaging. */
export function TextField({ form, name, label, ...inputProps }) {
  const error = form.formState.errors[name]
  const id = `field-${name}`
  const errorId = `${id}-error`

  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        {...inputProps}
        {...form.register(name)}
      />
      <FieldError id={errorId} errors={[error]} />
    </Field>
  )
}
