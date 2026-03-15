import { Router } from 'express'
import { createRental, listRentals } from '../controllers/rentalsController.js'

const router = Router()

router.get('/', listRentals)
router.post('/', createRental)

export default router
