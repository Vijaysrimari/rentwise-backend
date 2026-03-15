import crypto from 'crypto'

const TOKEN_SECRET = process.env.TOKEN_SECRET || 'rentwise-dev-secret'

function getSignature(userId) {
  return crypto.createHmac('sha256', TOKEN_SECRET).update(String(userId)).digest('hex').slice(0, 24)
}

function decodeToken(token) {
  try {
    const raw = Buffer.from(token, 'base64').toString('utf8')
    const [userId, signature] = raw.split('.')
    if (!userId || !signature) return null
    if (signature !== getSignature(userId)) return null
    return { userId }
  } catch {
    return null
  }
}

export function generateToken(userId) {
  const payload = `${userId}.${getSignature(userId)}`
  return Buffer.from(payload).toString('base64')
}

export function verifyToken(request, response, next) {
  const authHeader = request.headers.authorization || ''
  const [scheme, token] = authHeader.split(' ')

  if (scheme !== 'Bearer' || !token) {
    return response.status(401).json({ message: 'Unauthorized' })
  }

  const decoded = decodeToken(token)
  if (!decoded?.userId) {
    return response.status(401).json({ message: 'Invalid token' })
  }

  request.user = { id: decoded.userId }
  return next()
}

export default verifyToken
