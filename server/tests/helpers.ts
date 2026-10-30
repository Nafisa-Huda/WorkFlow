import { randomUUID } from 'node:crypto'
import type { Express } from 'express'
import mongoose from 'mongoose'
import request from 'supertest'
import { afterAll, afterEach, beforeAll, inject } from 'vitest'
import { createApp } from '../src/app.js'

/** Connects this test file to its own database and builds the app, wiping data between tests. */
export function setupTestApp() {
  const ctx = {} as { app: Express }

  beforeAll(async () => {
    await mongoose.connect(inject('mongoUri'), { dbName: `test-${randomUUID()}` })
    ctx.app = createApp()
  })

  afterEach(async () => {
    const collections = await mongoose.connection.db!.collections()
    await Promise.all(collections.map((c) => c.deleteMany({})))
  })

  afterAll(async () => {
    await mongoose.connection.dropDatabase()
    await mongoose.disconnect()
  })

  return ctx
}

let userCount = 0

/** A supertest agent (keeps the session cookie) for a freshly signed-up user. */
export async function signedInAgent(app: Express) {
  const agent = request.agent(app)
  const email = `user${++userCount}@example.com`
  await agent
    .post('/api/auth/signup')
    .send({ name: 'Test User', email, password: 'correct-horse-battery' })
    .expect(201)
  return agent
}
