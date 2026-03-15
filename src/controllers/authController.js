import User from '../models/User.js'
import bcrypt from 'bcryptjs'
import { generateToken } from '../middleware/verifyToken.js'

const formatUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone || '',
  address: user.address || '',
  bio: user.bio || '',
  role: user.role,
})

const normalizeIdentity = (request) => {
  const email = String(request.headers['x-user-email'] || request.body?.email || request.query?.email || '')
    .toLowerCase()
    .trim()
  const name = String(request.headers['x-user-name'] || request.body?.name || '').trim()
  const role = String(request.headers['x-user-role'] || request.body?.role || 'tenant').trim().toLowerCase()

  return { email, name, role }
}

const resolveRequestUser = async (request, { allowCreate = false, initialPassword } = {}) => {
  if (request.user?.id) {
    return User.findById(request.user.id)
  }

  const identity = normalizeIdentity(request)
  if (!identity.email) {
    return null
  }

  let user = await User.findOne({ email: identity.email })
  if (!user && allowCreate) {
    const passwordToHash = initialPassword || '12345678'
    user = await User.create({
      name: identity.name || identity.email.split('@')[0] || 'Tenant User',
      email: identity.email,
      password: await bcrypt.hash(passwordToHash, 10),
      role: ['admin', 'manager', 'support', 'tenant'].includes(identity.role) ? identity.role : 'tenant',
    })
  }

  return user
}

const loginByRole = async (request, response, allowedRoles) => {
  const { email, password } = request.body

  if (!email || !password) {
    return response.status(400).json({ message: 'Email and password are required.' })
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() })

  const isPasswordMatch = user
    ? (await bcrypt.compare(password, user.password).catch(() => false)) || user.password === password
    : false

  if (!user || !isPasswordMatch) {
    return response.status(401).json({ message: 'Invalid email or password.' })
  }

  if (!allowedRoles.includes(user.role)) {
    return response.status(403).json({ message: 'This account cannot use this login page.' })
  }

  const token = generateToken(user._id)
  return response.json({ user: formatUser(user), token })
}

export const loginUser = async (request, response) => {
  return loginByRole(request, response, ['manager', 'support', 'tenant'])
}

export const loginAdmin = async (request, response) => {
  return loginByRole(request, response, ['admin'])
}

export const login = async (request, response) => {
  return loginByRole(request, response, ['manager', 'support', 'tenant'])
}

export const register = async (request, response) => {
  return signup(request, response)
}

export const signup = async (request, response) => {
  const { name, email, password, role = 'tenant' } = request.body

  if (!name || !email || !password) {
    return response.status(400).json({ message: 'Name, email, and password are required.' })
  }

  if (password.length < 6) {
    return response.status(400).json({ message: 'Password must be at least 6 characters.' })
  }

  const allowedRoles = ['manager', 'support', 'tenant']
  const normalizedRole = allowedRoles.includes(role) ? role : 'tenant'
  const normalizedEmail = email.toLowerCase().trim()

  const existing = await User.findOne({ email: normalizedEmail })
  if (existing) {
    return response.status(409).json({ message: 'An account with this email already exists.' })
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    role: normalizedRole,
  })

  const token = generateToken(user._id)
  return response.status(201).json({ user: formatUser(user), token })
}

export const getProfile = async (request, response) => {
  try {
    const user = await User.findById(request.user.id).select('-password')
    if (!user) {
      return response.status(404).json({ message: 'User not found' })
    }
    return response.status(200).json(user)
  } catch (error) {
    return response.status(500).json({ message: error.message })
  }
}

export const updateProfile = async (request, response) => {
  try {
    const { name, email, phone, address, bio } = request.body

    if (email) {
      const existing = await User.findOne({
        email: String(email).toLowerCase().trim(),
        _id: { $ne: request.user.id },
      })

      if (existing) {
        return response.status(400).json({ message: 'Email already in use' })
      }
    }

    const updated = await User.findByIdAndUpdate(
      request.user.id,
      {
        ...(name && { name }),
        ...(email && { email: String(email).toLowerCase().trim() }),
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address }),
        ...(bio !== undefined && { bio }),
      },
      { new: true, runValidators: true },
    ).select('-password')

    return response.status(200).json(updated)
  } catch (error) {
    return response.status(500).json({ message: error.message })
  }
}

export const changePassword = async (request, response) => {
  try {
    const { currentPassword, newPassword } = request.body

    if (!currentPassword || !newPassword) {
      return response.status(400).json({ message: 'Current and new password are required' })
    }

    if (String(newPassword).length < 8) {
      return response.status(400).json({ message: 'New password must be at least 8 characters' })
    }

    const user = await User.findById(request.user.id).select('+password')
    if (!user) {
      return response.status(404).json({ message: 'User not found' })
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password)
    if (!isMatch) {
      return response.status(400).json({ message: 'Incorrect current password' })
    }

    user.password = await bcrypt.hash(newPassword, 10)
    await user.save()

    return response.status(200).json({ message: 'Password updated successfully' })
  } catch (error) {
    return response.status(500).json({ message: error.message })
  }
}

export const updatePassword = changePassword

export const logout = async (_request, response) => {
  return response.status(200).json({ message: 'Logged out successfully' })
}
