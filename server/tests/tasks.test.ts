import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { setupTestApp, signedInAgent } from './helpers.js'

const ctx = setupTestApp()

describe('tasks', () => {
  it('requires authentication', async () => {
    await request(ctx.app).get('/api/tasks').expect(401)
    await request(ctx.app).post('/api/tasks').send({ title: 'x' }).expect(401)
  })

  it('creates, updates, completes, and deletes a task', async () => {
    const agent = await signedInAgent(ctx.app)
    const { body: listsBody } = await agent.get('/api/lists')
    const workList = listsBody.lists[1]

    const { body: created } = await agent
      .post('/api/tasks')
      .send({ title: 'Write README', listId: workList.id, priority: 'high', dueDate: '2026-11-02' })
      .expect(201)
    expect(created.task).toMatchObject({
      title: 'Write README',
      listId: workList.id,
      priority: 'high',
      dueDate: '2026-11-02',
      completedAt: null,
    })

    const { body: updated } = await agent
      .patch(`/api/tasks/${created.task.id}`)
      .send({ title: 'Write a great README', completed: true })
      .expect(200)
    expect(updated.task.title).toBe('Write a great README')
    expect(updated.task.completedAt).not.toBeNull()

    const { body: reopened } = await agent
      .patch(`/api/tasks/${created.task.id}`)
      .send({ completed: false })
      .expect(200)
    expect(reopened.task.completedAt).toBeNull()

    await agent.delete(`/api/tasks/${created.task.id}`).expect(204)
    await agent.delete(`/api/tasks/${created.task.id}`).expect(404)
  })

  it('filters by status and due date range', async () => {
    const agent = await signedInAgent(ctx.app)
    await agent.post('/api/tasks').send({ title: 'Overdue', dueDate: '2026-10-28' })
    await agent.post('/api/tasks').send({ title: 'Today', dueDate: '2026-10-30' })
    await agent.post('/api/tasks').send({ title: 'Later', dueDate: '2026-11-15' })
    await agent.post('/api/tasks').send({ title: 'Someday' })
    const { body: done } = await agent
      .post('/api/tasks')
      .send({ title: 'Done', dueDate: '2026-10-30' })
    await agent.patch(`/api/tasks/${done.task.id}`).send({ completed: true })

    const titles = (body: { tasks: { title: string }[] }) => body.tasks.map((t) => t.title).sort()

    const { body: dueByToday } = await agent
      .get('/api/tasks')
      .query({ status: 'open', dueTo: '2026-10-30' })
      .expect(200)
    expect(titles(dueByToday)).toEqual(['Overdue', 'Today'])

    const { body: completed } = await agent.get('/api/tasks').query({ status: 'completed' })
    expect(titles(completed)).toEqual(['Done'])
  })

  it('validates input', async () => {
    const agent = await signedInAgent(ctx.app)
    await agent.post('/api/tasks').send({ title: '' }).expect(400)
    await agent.post('/api/tasks').send({ title: 'x', dueDate: '10/30/2026' }).expect(400)
    await agent.post('/api/tasks').send({ title: 'x', priority: 'urgent' }).expect(400)
    await agent
      .post('/api/tasks')
      .send({
        title: 'x',
        scheduledStart: '2026-10-30T15:00:00Z',
        scheduledEnd: '2026-10-30T14:00:00Z',
      })
      .expect(400)
    await agent.patch('/api/tasks/not-an-id').send({ title: 'x' }).expect(400)
  })

  it("never exposes or modifies another user's tasks", async () => {
    const alice = await signedInAgent(ctx.app)
    const mallory = await signedInAgent(ctx.app)
    const { body } = await alice.post('/api/tasks').send({ title: 'Private' }).expect(201)
    const id = body.task.id

    const { body: malloryTasks } = await mallory.get('/api/tasks')
    expect(malloryTasks.tasks).toHaveLength(0)
    await mallory.patch(`/api/tasks/${id}`).send({ title: 'pwned' }).expect(404)
    await mallory.delete(`/api/tasks/${id}`).expect(404)

    const { body: aliceTasks } = await alice.get('/api/tasks')
    expect(aliceTasks.tasks[0].title).toBe('Private')
  })

  it("rejects attaching a task to another user's list", async () => {
    const alice = await signedInAgent(ctx.app)
    const mallory = await signedInAgent(ctx.app)
    const { body } = await alice.get('/api/lists')

    await mallory.post('/api/tasks').send({ title: 'x', listId: body.lists[0].id }).expect(400)
  })

  it('moves tasks to the inbox when their list is deleted', async () => {
    const agent = await signedInAgent(ctx.app)
    const { body: listsBody } = await agent.get('/api/lists')
    const list = listsBody.lists[0]
    const { body } = await agent.post('/api/tasks').send({ title: 'x', listId: list.id })

    await agent.delete(`/api/lists/${list.id}`).expect(204)
    const { body: inbox } = await agent.get('/api/tasks').query({ listId: 'none' })
    expect(inbox.tasks.map((t: { id: string }) => t.id)).toEqual([body.task.id])
  })
})
