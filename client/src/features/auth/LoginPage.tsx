import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router'
import { z } from 'zod'
import { TextField } from '@/components/TextField'
import { Button } from '@/components/ui/button'
import { FieldError, FieldGroup } from '@/components/ui/field'
import { useLogin } from './api'
import { applyServerErrors } from '@/lib/forms'
import { AuthLayout } from './AuthForm'

const schema = z.object({
  email: z.email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useLogin()
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = form.handleSubmit((values) =>
    login.mutate(values, {
      onSuccess: () => navigate(location.state?.from ?? '/today', { replace: true }),
      onError: (error) => applyServerErrors(form, error),
    }),
  )

  return (
    <AuthLayout
      title="Welcome back"
      description="Log in to plan your day."
      footer={
        <>
          New to WorkFlow?{' '}
          <Link
            to="/signup"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate>
        <FieldGroup>
          <TextField
            form={form}
            name="email"
            label="Email"
            type="email"
            autoComplete="email"
            autoFocus
          />
          <TextField
            form={form}
            name="password"
            label="Password"
            type="password"
            autoComplete="current-password"
          />
          <FieldError role="alert">{form.formState.errors.root?.message}</FieldError>
          <Button type="submit" className="w-full" disabled={login.isPending}>
            {login.isPending ? 'Logging in…' : 'Log in'}
          </Button>
        </FieldGroup>
      </form>
    </AuthLayout>
  )
}
