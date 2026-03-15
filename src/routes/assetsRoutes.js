import { Router } from 'express'
import { createAsset, deleteAsset, listAssets } from '../controllers/assetsController.js'

const router = Router()

router.get('/', listAssets)
router.post('/', createAsset)
router.delete('/:id', deleteAsset)

export default router
