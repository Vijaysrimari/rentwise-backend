import { Router } from 'express'
import { createTenant, listTenants } from '../controllers/tenantsController.js'

const router = Router()

router.get('/', listTenants)
router.post('/', createTenant)

export default router
