import { Router } from 'express'
import { z } from 'zod'
import { HttpError, notFound } from '../lib/errors.js'
import { calendarDate, idParams, instant, objectId } from '../lib/validation.js'
import { requireAuth, userId } from '../middleware/auth.js'
import { List } from '../models/List.js'
import { PRIORITIES, Task } from '../models/Task.js'

const listQuery = z.object({
  listId: z.union([objectId, z.literal('none')]).optional(),
  status: z.enum(['open', 'completed', 'all']).default('all'),
  dueFrom: calendarDate.optional(),
  dueTo: calendarDate.optional(),
  scheduledFrom: instant.optional(),
  scheduledTo: instant.optional(),
})

const createTask = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  notes: z.string().max(5000).optional(),
  listId: objectId.nullable().optional(),
  priority: z.enum(PRIORITIES).optional(),
  dueDate: calendarDate.nullable().optional(),
  scheduledStart: instant.nullable().optional(),
  scheduledEnd: instant.nullable().optional(),
  order: z.number().optional(),
})

// Unknown keys (e.g. userId) are stripped by zod, so clients can't reassign ownership.
const updateTask = createTask.partial().extend({ completed: z.boolean().optional() })

async function assertOwnsList(owner: string, listId: string | null | undefined) {
  if (listId && !(await List.exists({ _id: listId, userId: owner }))) {
    throw new HttpError(400, 'List not found')
  }
}

const router = Router()
router.use(requireAuth)

router.get('/', async (req, res) => {
  const q = listQuery.parse(req.query)
  const filter: Record<string, unknown> = { userId: userId(req) }

  if (q.listId) filter.listId = q.listId === 'none' ? null : q.listId
  if (q.status === 'open') filter.completedAt = null
  if (q.status === 'completed') filter.completedAt = { $ne: null }
  if (q.dueFrom || q.dueTo) {
    // "YYYY-MM-DD" strings sort chronologically, so string comparison is a date-range query.
    filter.dueDate = {
      $ne: null,
      ...(q.dueFrom && { $gte: q.dueFrom }),
      ...(q.dueTo && { $lte: q.dueTo }),
    }
  }
  if (q.scheduledFrom || q.scheduledTo) {
    filter.scheduledStart = {
      $ne: null,
      ...(q.scheduledFrom && { $gte: q.scheduledFrom }),
      ...(q.scheduledTo && { $lt: q.scheduledTo }),
    }
  }

  const tasks = await Task.find(filter).sort({ completedAt: 1, order: 1, createdAt: 1 })
  res.json({ tasks })
})

router.post('/', async (req, res) => {
  const body = createTask.parse(req.body)
  await assertOwnsList(userId(req), body.listId)
  const task = await Task.create({ ...body, userId: userId(req) })
  res.status(201).json({ task })
})

router.patch('/:id', async (req, res) => {
  const { id } = idParams.parse(req.params)
  const { completed, ...changes } = updateTask.parse(req.body)

  const task = await Task.findOne({ _id: id, userId: userId(req) })
  if (!task) throw notFound('Task')
  await assertOwnsList(userId(req), changes.listId)

  task.set(changes)
  if (completed !== undefined) {
    task.completedAt = completed ? (task.completedAt ?? new Date()) : null
  }
  await task.save()
  res.json({ task })
})

router.delete('/:id', async (req, res) => {
  const { id } = idParams.parse(req.params)
  const { deletedCount } = await Task.deleteOne({ _id: id, userId: userId(req) })
  if (!deletedCount) throw notFound('Task')
  res.status(204).end()
})

export default router
