import mongoose from 'mongoose'
import { createApp } from './app.js'
import { env } from './config/env.js'

await mongoose.connect(env.MONGODB_URI)
console.log(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`)

createApp().listen(env.PORT, () => {
  console.log(`API listening on http://localhost:${env.PORT}`)
})
