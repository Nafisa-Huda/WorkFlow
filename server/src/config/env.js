// Read and check environment variables once, at startup.
// Failing fast here beats failing on the first request.

const { NODE_ENV = 'development', PORT = '4000', MONGODB_URI, SESSION_SECRET } = process.env

if (!MONGODB_URI) {
  console.error('MONGODB_URI is required (see server/.env.example)')
  process.exit(1)
}
if (!SESSION_SECRET || SESSION_SECRET.length < 32) {
  console.error('SESSION_SECRET must be at least 32 characters (see server/.env.example)')
  process.exit(1)
}

export const env = { NODE_ENV, PORT: Number(PORT), MONGODB_URI, SESSION_SECRET }
export const isProduction = NODE_ENV === 'production'
export const isTest = NODE_ENV === 'test'
