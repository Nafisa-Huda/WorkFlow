import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'
import { z } from 'zod'
import { TextField } from '@/components/TextField'
import { Button } from '@/components/ui/button'
import { FieldError, FieldGroup } from '@/components/ui/field'
import { useSignup } from './api'
import { applyServerErrors } from '@/lib/forms'
import { AuthLayout } from './AuthLayout'

// Mirrors the server's rules so most mistakes are caught before a round trip.
const schema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(80),
  email: z.email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
})

export function SignupPage() {
  const navigate = useNavigate()
  const signup = useSignup()
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', password: '' },
  })

  const onSubmit = form.handleSubmit((values) =>
    signup.mutate(values, {
      onSuccess: () => navigate('/today', { replace: true }),
      onError: (error) => applyServerErrors(form, error),
    }),
  )

  return (
    <AuthLayout
      title="Create your account"
      description="Tasks, calendar, and focus time in one place."
      footer={
        <>
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate>
        <FieldGroup>
          <TextField form={form} name="name" label="Name" autoComplete="name" autoFocus />
          <TextField form={form} name="email" label="Email" type="email" autoComplete="email" />
          <TextField
            form={form}
            name="password"
            label="Password"
            type="password"
            autoComplete="new-password"
          />
          <FieldError role="alert">{form.formState.errors.root?.message}</FieldError>
          <Button type="submit" className="w-full" disabled={signup.isPending}>
            {signup.isPending ? 'Creating account…' : 'Create account'}
          </Button>
        </FieldGroup>
      </form>
    </AuthLayout>
  )
}
