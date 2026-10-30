import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { setupTestApp } from './helpers.js'

const ctx = setupTestApp()
const credentials = { name: 'Ada', email: 'Ada@Example.com', password: 'correct-horse-battery' }

describe('auth', () => {
  it('signs up, starts a session, and creates default lists', async () => {
    const agent = request.agent(ctx.app)

    const signup = await agent.post('/api/auth/signup').send(credentials).expect(201)
    expect(signup.body.user).toMatchObject({ name: 'Ada', email: 'ada@example.com' })
    expect(signup.body.user).not.toHaveProperty('passwordHash')

    const me = await agent.get('/api/auth/me').expect(200)
    expect(me.body.user.email).toBe('ada@example.com')

    const lists = await agent.get('/api/lists').expect(200)
    expect(lists.body.lists.map((l: { name: string }) => l.name)).toEqual([
      'Personal',
      'Work',
      'School',
    ])
  })

  it('rejects a duplicate email regardless of case', async () => {
    await request(ctx.app).post('/api/auth/signup').send(credentials).expect(201)
    const res = await request(ctx.app)
      .post('/api/auth/signup')
      .send({ ...credentials, email: 'ADA@example.com' })
      .expect(409)
    expect(res.body.error).toMatch(/already exists/)
  })

  it('returns field errors for invalid signup input', async () => {
    const res = await request(ctx.app)
      .post('/api/auth/signup')
      .send({ name: '', email: 'not-an-email', password: 'short' })
      .expect(400)
    expect(Object.keys(res.body.fields).sort()).toEqual(['email', 'name', 'password'])
  })

  it('logs in and out', async () => {
    await request(ctx.app).post('/api/auth/signup').send(credentials).expect(201)
    const agent = request.agent(ctx.app)

    await agent
      .post('/api/auth/login')
      .send({ email: credentials.email, password: credentials.password })
      .expect(200)
    await agent.get('/api/auth/me').expect(200)

    await agent.post('/api/auth/logout').expect(204)
    await agent.get('/api/auth/me').expect(401)
  })

  it('gives the same error for an unknown email and a wrong password', async () => {
    await request(ctx.app).post('/api/auth/signup').send(credentials).expect(201)

    const wrongPassword = await request(ctx.app)
      .post('/api/auth/login')
      .send({ email: credentials.email, password: 'wrong-password' })
      .expect(401)
    const unknownEmail = await request(ctx.app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'wrong-password' })
      .expect(401)

    expect(wrongPassword.body.error).toBe(unknownEmail.body.error)
  })
})
