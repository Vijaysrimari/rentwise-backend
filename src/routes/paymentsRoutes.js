import { Router } from 'express'
import { getPendingPaymentsCount, listPayments } from '../controllers/paymentsController.js'

const router = Router()

router.get('/', listPayments)
router.get('/pending-count', getPendingPaymentsCount)

export default router
