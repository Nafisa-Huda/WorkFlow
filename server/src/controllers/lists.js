import { z } from 'zod'
import { notFound } from '../lib/errors.js'
import { LIST_COLORS, List } from '../models/List.js'
import { Task } from '../models/Task.js'

const createSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(60),
  color: z.enum(LIST_COLORS).optional(),
})

const updateSchema = createSchema.partial()

// GET /api/lists
export async function getLists(req, res) {
  const lists = await List.find({ userId: req.session.userId }).sort({ createdAt: 1, _id: 1 })
  res.json({ lists })
}

// POST /api/lists
export async function createList(req, res) {
  const body = createSchema.parse(req.body)
  const list = await List.create({ ...body, userId: req.session.userId })
  res.status(201).json({ list })
}

// PATCH /api/lists/:id
export async function updateList(req, res) {
  const list = await List.findOne({ _id: req.params.id, userId: req.session.userId })
  if (!list) throw notFound('List')
  list.set(updateSchema.parse(req.body))
  await list.save()
  res.json({ list })
}

// DELETE /api/lists/:id
// Deleting a list keeps its tasks; they move to the inbox (listId: null).
export async function deleteList(req, res) {
  const { deletedCount } = await List.deleteOne({ _id: req.params.id, userId: req.session.userId })
  if (!deletedCount) throw notFound('List')
  await Task.updateMany({ userId: req.session.userId, listId: req.params.id }, { listId: null })
  res.status(204).end()
}
