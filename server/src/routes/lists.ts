import { Router } from 'express'
import { z } from 'zod'
import { notFound } from '../lib/errors.js'
import { idParams } from '../lib/validation.js'
import { requireAuth, userId } from '../middleware/auth.js'
import { LIST_COLORS, List } from '../models/List.js'
import { Task } from '../models/Task.js'

const createList = z.object({
  name: z.string().trim().min(1, 'Name is required').max(60),
  color: z.enum(LIST_COLORS).optional(),
  order: z.number().optional(),
})

const updateList = createList.partial()

const router = Router()
router.use(requireAuth)

router.get('/', async (req, res) => {
  const lists = await List.find({ userId: userId(req) }).sort({ order: 1, createdAt: 1 })
  res.json({ lists })
})

router.post('/', async (req, res) => {
  const body = createList.parse(req.body)
  const list = await List.create({ ...body, userId: userId(req) })
  res.status(201).json({ list })
})

router.patch('/:id', async (req, res) => {
  const { id } = idParams.parse(req.params)
  const list = await List.findOne({ _id: id, userId: userId(req) })
  if (!list) throw notFound('List')
  list.set(updateList.parse(req.body))
  await list.save()
  res.json({ list })
})

// Deleting a list keeps its tasks; they move to the inbox (listId: null).
router.delete('/:id', async (req, res) => {
  const { id } = idParams.parse(req.params)
  const { deletedCount } = await List.deleteOne({ _id: id, userId: userId(req) })
  if (!deletedCount) throw notFound('List')
  await Task.updateMany({ userId: userId(req), listId: id }, { listId: null })
  res.status(204).end()
})

export default router
