import { Router } from 'express'
import { z } from 'zod'
import { HttpError } from '../lib/errors.js'
import { instant, objectId } from '../lib/validation.js'
import { requireAuth, userId } from '../middleware/auth.js'
import { FocusSession } from '../models/FocusSession.js'
import { Task } from '../models/Task.js'

const rangeQuery = z.object({ from: instant, to: instant })

const createSession = z.object({
  taskId: objectId.nullable().optional(),
  startedAt: instant,
  durationSec: z
    .number()
    .int()
    .min(1)
    .max(60 * 60 * 4),
})

const router = Router()
router.use(requireAuth)

router.get('/', async (req, res) => {
  const { from, to } = rangeQuery.parse(req.query)
  const sessions = await FocusSession.find({
    userId: userId(req),
    startedAt: { $gte: from, $lt: to },
  }).sort({ startedAt: -1 })
  res.json({ sessions })
})

router.post('/', async (req, res) => {
  const body = createSession.parse(req.body)
  if (body.taskId && !(await Task.exists({ _id: body.taskId, userId: userId(req) }))) {
    throw new HttpError(400, 'Task not found')
  }
  const session = await FocusSession.create({ ...body, userId: userId(req) })
  res.status(201).json({ session })
})

export default router
