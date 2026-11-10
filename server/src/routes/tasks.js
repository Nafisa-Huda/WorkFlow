import { Router } from 'express'
import { createTask, deleteTask, getTask, getTasks, updateTask } from '../controllers/tasks.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

router.get('/', getTasks)
router.get('/:id', getTask)
router.post('/', createTask)
router.patch('/:id', updateTask)
router.delete('/:id', deleteTask)

export default router
