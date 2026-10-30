import mongoose from 'mongoose'
import { createApp } from './app.js'
import { env } from './config/env.js'

await mongoose.connect(env.MONGODB_URI)
console.log(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`)

const server = createApp().listen(env.PORT, () => {
  console.log(`API listening on http://localhost:${env.PORT}`)
})

// Let in-flight requests finish when the host stops the process (deploys, restarts).
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    server.close(() => {
      void mongoose.disconnect().then(() => process.exit(0))
    })
  })
}
