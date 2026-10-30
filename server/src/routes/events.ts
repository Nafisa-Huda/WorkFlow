import { Router } from 'express'
import { z } from 'zod'
import { notFound } from '../lib/errors.js'
import { idParams, instant } from '../lib/validation.js'
import { requireAuth, userId } from '../middleware/auth.js'
import { Event } from '../models/Event.js'

// The client sends the range for the user's local day/week/month, so the
// server never has to guess the user's timezone.
const rangeQuery = z.object({ from: instant, to: instant })

const createEvent = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  notes: z.string().max(5000).optional(),
  start: instant,
  end: instant,
})

const updateEvent = createEvent.partial()

const router = Router()
router.use(requireAuth)

router.get('/', async (req, res) => {
  const { from, to } = rangeQuery.parse(req.query)
  // Overlap, not containment: include events that started before `from` but are still running.
  const events = await Event.find({
    userId: userId(req),
    start: { $lt: to },
    end: { $gt: from },
  }).sort({
    start: 1,
  })
  res.json({ events })
})

router.post('/', async (req, res) => {
  const event = await Event.create({ ...createEvent.parse(req.body), userId: userId(req) })
  res.status(201).json({ event })
})

router.patch('/:id', async (req, res) => {
  const { id } = idParams.parse(req.params)
  const event = await Event.findOne({ _id: id, userId: userId(req) })
  if (!event) throw notFound('Event')
  // set + save (rather than findOneAndUpdate) so the start/end check sees the merged document.
  event.set(updateEvent.parse(req.body))
  await event.save()
  res.json({ event })
})

router.delete('/:id', async (req, res) => {
  const { id } = idParams.parse(req.params)
  const { deletedCount } = await Event.deleteOne({ _id: id, userId: userId(req) })
  if (!deletedCount) throw notFound('Event')
  res.status(204).end()
})

export default router
