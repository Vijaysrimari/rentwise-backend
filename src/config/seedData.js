import Asset from '../models/Asset.js'
import Payment from '../models/Payment.js'
import Rental from '../models/Rental.js'
import Tenant from '../models/Tenant.js'
import User from '../models/User.js'

const starterAssets = [
  {
    name: 'Harbor View A1',
    location: 'Miami',
    status: 'occupied',
    rentAmount: 2400,
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Cedar Suites 21B',
    location: 'Austin',
    status: 'occupied',
    rentAmount: 2100,
    imageUrl: 'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Maple Lofts 9C',
    location: 'Denver',
    status: 'vacant',
    rentAmount: 1800,
    imageUrl: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=600&q=80',
  },
]

const starterUsers = [
  { name: 'System Admin', email: 'admin@rentwise.io', password: 'admin123', role: 'admin' },
  { name: 'Operations User', email: 'user@rentwise.io', password: 'user1234', role: 'manager' },
]

const starterTenants = [
  { fullName: 'Tenant Account 1', email: 'tenant1@example.com', phone: '+1-555-0142', unit: 'Harbor View A1' },
  { fullName: 'Tenant Account 2', email: 'tenant2@example.com', phone: '+1-555-0166', unit: 'Cedar Suites 21B' },
]

const starterRentals = [
  {
    assetName: 'Harbor View A1',
    tenantName: 'Tenant Account 1',
    startDate: new Date('2025-07-01'),
    rentAmount: 2400,
    status: 'active',
  },
  {
    assetName: 'Cedar Suites 21B',
    tenantName: 'Tenant Account 2',
    startDate: new Date('2025-09-01'),
    rentAmount: 2100,
    status: 'active',
  },
]

const starterPayments = [
  {
    tenantName: 'Tenant Account 1',
    assetName: 'Harbor View A1',
    amount: 2400,
    dueDate: new Date('2026-03-01'),
    status: 'paid',
  },
  {
    tenantName: 'Tenant Account 2',
    assetName: 'Cedar Suites 21B',
    amount: 2100,
    dueDate: new Date('2026-03-01'),
    status: 'pending',
  },
  {
    tenantName: 'Tenant Account 2',
    assetName: 'Cedar Suites 21B',
    amount: 2100,
    dueDate: new Date('2026-02-01'),
    status: 'late',
  },
]

export const seedDatabase = async () => {
  const [assetCount, userCount, tenantCount, rentalCount, paymentCount] = await Promise.all([
    Asset.countDocuments(),
    User.countDocuments(),
    Tenant.countDocuments(),
    Rental.countDocuments(),
    Payment.countDocuments(),
  ])

  if (assetCount === 0) {
    await Asset.insertMany(starterAssets)
  }

  if (userCount === 0) {
    await User.insertMany(starterUsers)
  }

  if (tenantCount === 0) {
    await Tenant.insertMany(starterTenants)
  }

  if (rentalCount === 0) {
    await Rental.insertMany(starterRentals)
  }

  if (paymentCount === 0) {
    await Payment.insertMany(starterPayments)
  }

  // Backfill legacy documents from earlier project versions.
  await Asset.updateMany({ imageUrl: { $exists: false } }, { $set: { imageUrl: '' } })
  await User.updateMany({ password: { $exists: false } }, { $set: { password: 'changeMe123' } })

  await User.updateOne(
    { email: 'elena@rentwise.io' },
    { $set: { name: 'System Admin', email: 'admin@rentwise.io', password: 'admin123', role: 'admin' } },
  )

  await User.updateOne(
    { email: 'noah@rentwise.io' },
    { $set: { name: 'Operations User', email: 'user@rentwise.io', password: 'user1234', role: 'manager' } },
  )

  await Tenant.updateOne({ fullName: 'Marcus Allen' }, { $set: { fullName: 'Tenant Account 1' } })
  await Tenant.updateOne({ fullName: 'Rita Sharma' }, { $set: { fullName: 'Tenant Account 2' } })
  await Rental.updateOne({ tenantName: 'Marcus Allen' }, { $set: { tenantName: 'Tenant Account 1' } })
  await Rental.updateMany({ tenantName: 'Rita Sharma' }, { $set: { tenantName: 'Tenant Account 2' } })
  await Payment.updateOne({ tenantName: 'Marcus Allen' }, { $set: { tenantName: 'Tenant Account 1' } })
  await Payment.updateMany({ tenantName: 'Rita Sharma' }, { $set: { tenantName: 'Tenant Account 2' } })
}
