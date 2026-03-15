import { Router } from 'express'
import {
	changePassword,
	getProfile,
	login,
	loginAdmin,
	loginUser,
	logout,
	register,
	signup,
	updateProfile,
} from '../controllers/authController.js'
import { verifyToken } from '../middleware/verifyToken.js'

const router = Router()

router.post('/register', register)
router.post('/signup', signup)
router.post('/login', login)
router.post('/login/user', loginUser)
router.post('/login/admin', loginAdmin)

router.get('/profile', verifyToken, getProfile)
router.put('/profile', verifyToken, updateProfile)
router.put('/password', verifyToken, changePassword)
router.post('/logout', verifyToken, logout)

export default router
