import { Router } from 'express'
import { createList, deleteList, getLists, updateList } from '../controllers/lists.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

router.get('/', getLists)
router.post('/', createList)
router.patch('/:id', updateList)
router.delete('/:id', deleteList)

export default router
