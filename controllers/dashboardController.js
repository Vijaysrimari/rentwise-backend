const Asset = require('../models/Asset');
const User = require('../models/User');
const Rental = require('../models/Rental');
const Payment = require('../models/Payment');
const SupportRequest = require('../models/SupportRequest');
const mongoose = require('mongoose');

const monthBounds = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return { start, end };
};

exports.getAdminDashboard = async (_req, res, next) => {
  try {
    const { start, end } = monthBounds();

    const [
      totalAssets,
      totalTenants,
      activeRentals,
      paidThisMonth,
      recentRentals,
      categoryBreakdown,
    ] = await Promise.all([
      Asset.countDocuments(),
      User.countDocuments({ role: 'tenant' }),
      Rental.countDocuments({ status: 'active' }),
      Payment.aggregate([
        { $match: { status: 'paid', paymentDate: { $gte: start, $lt: end } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Rental.find().sort({ createdAt: -1 }).limit(5).populate('asset tenant owner', 'title name email'),
      Asset.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
    ]);

    return res.json({
      success: true,
      message: 'Admin dashboard fetched',
      data: {
        totalAssets,
        totalTenants,
        activeRentals,
        totalRevenue: paidThisMonth[0]?.total || 0,
        recentRentals,
        categoryBreakdown,
      },
    });
  } catch (error) {
    return next(error);
  }
};

exports.getOwnerDashboard = async (req, res, next) => {
  try {
    const ownerId = req.user.id;

    const [
      totalAssets,
      occupiedAssets,
      pendingRequests,
      activeRentals,
      recentRentals,
      recentPayments,
    ] = await Promise.all([
      Asset.countDocuments({ owner: ownerId }),
      Asset.countDocuments({ owner: ownerId, status: 'occupied' }),
      Rental.countDocuments({ owner: ownerId, status: 'pending' }),
      Rental.countDocuments({ owner: ownerId, status: 'active' }),
      Rental.find({ owner: ownerId })
        .populate('tenant', 'name email phone')
        .populate('asset', 'title category images')
        .sort({ createdAt: -1 })
        .limit(5)
        .then((list) => list.filter((rental) => rental.tenant && rental.asset)),
      Payment.find({ owner: ownerId })
        .populate('tenant', 'name email')
        .sort({ createdAt: -1 })
        .limit(5)
        .then((list) => list.filter((payment) => payment.tenant)),
    ]);

    const revenueResult = await Payment.aggregate([
      {
        $match: {
          owner: new mongoose.Types.ObjectId(ownerId),
          status: 'paid',
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    return res.status(200).json({
      totalAssets,
      occupiedAssets,
      vacantAssets: totalAssets - occupiedAssets,
      pendingRequests,
      activeRentals,
      totalRevenue: revenueResult[0]?.total || 0,
      recentPayments,
      recentRentals,
    });
  } catch (error) {
    console.error('ownerDashboard error:', error);
    return res.status(500).json({ message: error.message });
  }
};

exports.getManagerDashboard = async (_req, res, next) => {
  try {
    const [
      totalAssets,
      pendingRequests,
      activeRentals,
      openSupport,
      recentRequests,
      recentSupport,
    ] = await Promise.all([
      Asset.countDocuments(),
      Rental.countDocuments({ status: 'pending' }),
      Rental.countDocuments({ status: 'active' }),
      SupportRequest.countDocuments({ status: { $in: ['open', 'in-progress'] } }),
      Rental.find({ status: 'pending' })
        .populate('tenant', 'name email phone')
        .populate('asset', 'title category images location')
        .populate('owner', 'name email')
        .sort({ createdAt: -1 })
        .limit(5)
        .then((list) => list.filter((rental) => rental.tenant && rental.asset)),
      SupportRequest.find({ status: { $in: ['open', 'in-progress'] } })
        .populate('tenant', 'name email')
        .sort({ createdAt: -1 })
        .limit(5)
        .then((list) => list.filter((request) => request.tenant)),
    ]);

    return res.status(200).json({
      totalAssets,
      pendingRequests,
      activeRentals,
      openSupport,
      recentRequests,
      recentSupport,
    });
  } catch (error) {
    console.error('managerDashboard error:', error);
    return res.status(500).json({ message: error.message });
  }
};

exports.getTenantDashboard = async (req, res, next) => {
  try {
    const tenantId = req.user.id;

    const [activeRental, paidPayments, pendingPayments, recentPayments, supportRequests] = await Promise.all([
      Rental.findOne({ tenant: tenantId, status: 'active' }).populate('asset').populate('owner', 'name email phone'),
      Payment.find({ tenant: tenantId, status: 'paid' }).select('amount'),
      Payment.countDocuments({ tenant: tenantId, status: { $in: ['pending', 'overdue'] } }),
      Payment.find({ tenant: tenantId }).sort({ paymentDate: -1 }).limit(5),
      SupportRequest.find({ tenant: tenantId }).sort({ createdAt: -1 }).limit(3),
    ]);

    const totalPaid = paidPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);

    return res.json({
      success: true,
      message: 'Tenant dashboard fetched',
      data: {
        activeRental,
        totalPaid,
        pendingPayments,
        recentPayments,
        supportRequests,
      },
    });
  } catch (error) {
    return next(error);
  }
};
