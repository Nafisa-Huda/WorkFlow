import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 characters'),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  // Fail fast at boot instead of failing on the first request.
  console.error('Invalid environment variables:', z.flattenError(parsed.error).fieldErrors)
  process.exit(1)
}

export const env = parsed.data
export const isProduction = env.NODE_ENV === 'production'
export const isTest = env.NODE_ENV === 'test'
