import Asset from '../models/Asset.js'
import Payment from '../models/Payment.js'

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export const getDashboardOverview = async (request, response) => {
  const userId = request.query.userId
  
  const assetFilter = userId ? { userId } : {}
  const paymentFilter = userId ? { userId } : {}
  
  const [assets, payments] = await Promise.all([
    Asset.find(assetFilter),
    Payment.find(paymentFilter).sort({ dueDate: 1 })
  ])

  const occupiedAssets = assets.filter((asset) => asset.status === 'occupied').length
  const pendingMaintenance = assets.filter((asset) => asset.status === 'maintenance').length
  const revenue = payments
    .filter((payment) => payment.status === 'paid')
    .reduce((sum, payment) => sum + payment.amount, 0)

  const monthlyMap = new Map()

  payments.forEach((payment) => {
    const date = new Date(payment.dueDate)
    const key = `${date.getFullYear()}-${date.getMonth()}`
    const label = months[date.getMonth()]

    if (!monthlyMap.has(key)) {
      monthlyMap.set(key, { month: label, revenue: 0 })
    }

    if (payment.status === 'paid') {
      monthlyMap.get(key).revenue += payment.amount
    }
  })

  const revenueTrend = Array.from(monthlyMap.values())
  const occupancySplit = [
    { name: 'Occupied', value: occupiedAssets },
    { name: 'Vacant', value: Math.max(assets.length - occupiedAssets, 0) },
  ]

  response.json({
    stats: {
      occupiedAssets,
      revenue,
      pendingMaintenance,
    },
    revenueTrend,
    occupancySplit,
  })
}
