import { Router } from 'express'
import { createUser, deleteUser, listUsers } from '../controllers/usersController.js'

const router = Router()

router.get('/', listUsers)
router.post('/', createUser)
router.delete('/:id', deleteUser)

export default router
