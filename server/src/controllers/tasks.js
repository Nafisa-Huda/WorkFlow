import { z } from 'zod'
import { HttpError, notFound } from '../lib/errors.js'
import { calendarDate, instant } from '../lib/validation.js'
import { List } from '../models/List.js'
import { PRIORITIES, Task } from '../models/Task.js'

const listQuery = z.object({
  listId: z.string().optional(), // a list id, or "none" for the inbox
  status: z.enum(['open', 'completed', 'all']).default('all'),
  dueFrom: calendarDate.optional(),
  dueTo: calendarDate.optional(),
  scheduledFrom: instant.optional(),
  scheduledTo: instant.optional(),
})

const createSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  notes: z.string().max(5000).optional(),
  listId: z.string().nullable().optional(),
  priority: z.enum(PRIORITIES).optional(),
  dueDate: calendarDate.nullable().optional(),
  scheduledStart: instant.nullable().optional(),
  scheduledEnd: instant.nullable().optional(),
})

// Every field optional for PATCH. Unknown keys (e.g. userId) are stripped by zod,
// so clients can't reassign a task to another user.
const updateSchema = createSchema.partial().extend({ completed: z.boolean().optional() })

/** Stops a user from putting a task in someone else's list. */
async function assertOwnsList(userId, listId) {
  if (listId && !(await List.exists({ _id: listId, userId }))) {
    throw new HttpError(400, 'List not found')
  }
}

// GET /api/tasks?listId=&status=&dueFrom=&dueTo=&scheduledFrom=&scheduledTo=
export async function getTasks(req, res) {
  const q = listQuery.parse(req.query)
  // Every query is scoped to the signed-in user.
  const filter = { userId: req.session.userId }

  if (q.listId) filter.listId = q.listId === 'none' ? null : q.listId
  if (q.status === 'open') filter.completedAt = null
  if (q.status === 'completed') filter.completedAt = { $ne: null }

  // "YYYY-MM-DD" strings sort chronologically, so string comparison works as a date range.
  if (q.dueFrom || q.dueTo) {
    filter.dueDate = { $ne: null }
    if (q.dueFrom) filter.dueDate.$gte = q.dueFrom
    if (q.dueTo) filter.dueDate.$lte = q.dueTo
  }
  if (q.scheduledFrom || q.scheduledTo) {
    filter.scheduledStart = { $ne: null }
    if (q.scheduledFrom) filter.scheduledStart.$gte = q.scheduledFrom
    if (q.scheduledTo) filter.scheduledStart.$lt = q.scheduledTo
  }

  const tasks = await Task.find(filter).sort({ completedAt: 1, createdAt: 1 })
  res.json({ tasks })
}

// GET /api/tasks/:id
export async function getTask(req, res) {
  const task = await Task.findOne({ _id: req.params.id, userId: req.session.userId })
  if (!task) throw notFound('Task')
  res.json({ task })
}

// POST /api/tasks
export async function createTask(req, res) {
  const body = createSchema.parse(req.body)
  await assertOwnsList(req.session.userId, body.listId)
  const task = await Task.create({ ...body, userId: req.session.userId })
  res.status(201).json({ task })
}

// PATCH /api/tasks/:id
export async function updateTask(req, res) {
  const { completed, ...changes } = updateSchema.parse(req.body)

  const task = await Task.findOne({ _id: req.params.id, userId: req.session.userId })
  if (!task) throw notFound('Task')
  await assertOwnsList(req.session.userId, changes.listId)

  // Apply the changes and save, so the schema's checks run on the fully updated task
  // (e.g. a new end time is checked against the existing start time).
  task.set(changes)
  if (completed !== undefined) {
    // Keep the original completion time if it's already complete.
    task.completedAt = completed ? (task.completedAt ?? new Date()) : null
  }
  await task.save()
  res.json({ task })
}

// DELETE /api/tasks/:id
export async function deleteTask(req, res) {
  const { deletedCount } = await Task.deleteOne({ _id: req.params.id, userId: req.session.userId })
  if (!deletedCount) throw notFound('Task')
  res.status(204).end()
}
