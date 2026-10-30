import { describe, expect, it } from 'vitest'
import { setupTestApp, signedInAgent } from './helpers.js'

const ctx = setupTestApp()

describe('events', () => {
  it('returns events that overlap the requested range', async () => {
    const agent = await signedInAgent(ctx.app)
    const create = (title: string, start: string, end: string) =>
      agent.post('/api/events').send({ title, start, end }).expect(201)

    await create('Late-night deploy', '2026-10-29T23:00:00Z', '2026-10-30T01:00:00Z')
    await create('Standup', '2026-10-30T14:00:00Z', '2026-10-30T14:15:00Z')
    await create('Tomorrow', '2026-10-31T14:00:00Z', '2026-10-31T15:00:00Z')

    const { body } = await agent
      .get('/api/events')
      .query({ from: '2026-10-30T00:00:00Z', to: '2026-10-31T00:00:00Z' })
      .expect(200)
    expect(body.events.map((e: { title: string }) => e.title)).toEqual([
      'Late-night deploy',
      'Standup',
    ])
  })

  it('requires a range and a valid start/end', async () => {
    const agent = await signedInAgent(ctx.app)
    await agent.get('/api/events').expect(400)
    await agent
      .post('/api/events')
      .send({ title: 'Backwards', start: '2026-10-30T15:00:00Z', end: '2026-10-30T14:00:00Z' })
      .expect(400)
  })

  it('validates start/end against the stored event on partial updates', async () => {
    const agent = await signedInAgent(ctx.app)
    const { body } = await agent
      .post('/api/events')
      .send({ title: 'Lunch', start: '2026-10-30T16:00:00Z', end: '2026-10-30T17:00:00Z' })
    await agent
      .patch(`/api/events/${body.event.id}`)
      .send({ end: '2026-10-30T15:00:00Z' })
      .expect(400)
    await agent
      .patch(`/api/events/${body.event.id}`)
      .send({ end: '2026-10-30T17:30:00Z' })
      .expect(200)
  })

  it("can't delete another user's event", async () => {
    const alice = await signedInAgent(ctx.app)
    const mallory = await signedInAgent(ctx.app)
    const { body } = await alice
      .post('/api/events')
      .send({ title: 'Private', start: '2026-10-30T16:00:00Z', end: '2026-10-30T17:00:00Z' })
    await mallory.delete(`/api/events/${body.event.id}`).expect(404)
  })
})
