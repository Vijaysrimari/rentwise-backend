import Payment from '../models/Payment.js'

export const listPayments = async (request, response) => {
  const userId = request.query.tenant || request.query.userId
  const filter = userId ? { userId } : {}
  const payments = await Payment.find(filter).sort({ dueDate: -1 })
  response.json(payments)
}

export const getPendingPaymentsCount = async (request, response) => {
  const userId = request.query.tenant || request.query.userId
  const filter = { status: 'pending' }

  if (userId) {
    filter.userId = userId
  }

  const count = await Payment.countDocuments(filter)
  response.json({ count })
}
