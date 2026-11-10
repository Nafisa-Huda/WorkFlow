import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import request from 'supertest'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { createApp } from '../src/app.js'

/**
 * Gives each test file its own in-memory MongoDB (no real database needed)
 * and wipes the data between tests, so every test starts from empty.
 */
export function setupTestApp() {
  const ctx = {}
  let mongo

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create()
    await mongoose.connect(mongo.getUri())
    ctx.app = createApp()
  })

  afterEach(async () => {
    const collections = await mongoose.connection.db.collections()
    await Promise.all(collections.map((c) => c.deleteMany({})))
  })

  afterAll(async () => {
    await mongoose.disconnect()
    await mongo.stop()
  })

  return ctx
}

let userCount = 0

/** A supertest agent (keeps the session cookie, like a browser) for a freshly signed-up user. */
export async function signedInAgent(app) {
  const agent = request.agent(app)
  const email = `user${++userCount}@example.com`
  await agent
    .post('/api/auth/signup')
    .send({ name: 'Test User', email, password: 'correct-horse-battery' })
    .expect(201)
  return agent
}
