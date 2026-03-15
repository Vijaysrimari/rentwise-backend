import User from '../models/User.js'

export const listUsers = async (_request, response) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 })
  response.json(users)
}

export const createUser = async (request, response) => {
  const payload = {
    ...request.body,
    password: request.body.password || 'changeMe123',
  }

  const user = await User.create(payload)
  const safeUser = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  }

  response.status(201).json(safeUser)
}

export const deleteUser = async (request, response) => {
  await User.findByIdAndDelete(request.params.id)
  response.status(204).send()
}
