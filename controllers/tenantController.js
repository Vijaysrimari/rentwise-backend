const Tenant = require('../models/Tenant');
const Rental = require('../models/Rental');

exports.getAllTenants = async (req, res, next) => {
  try {
    let tenants = [];

    if (req.user.role === 'owner') {
      const rentals = await Rental.find({
        owner: req.user.id,
        status: { $in: ['active', 'pending'] },
      })
        .populate({
          path: 'tenant',
          select: 'name email phone address bio createdAt',
        })
        .populate({
          path: 'asset',
          select: 'title category location images rentAmount',
        })
        .sort({ createdAt: -1 });

      const seen = new Set();
      tenants = rentals
        .filter((rental) => {
          const tenantId = rental.tenant?._id?.toString();
          if (!tenantId || seen.has(tenantId)) {
            return false;
          }
          seen.add(tenantId);
          return true;
        })
        .map((rental) => ({
          _id: rental.tenant._id,
          name: rental.tenant.name,
          email: rental.tenant.email,
          phone: rental.tenant.phone || '—',
          address: rental.tenant.address || '—',
          bio: rental.tenant.bio || '',
          joinedOn: rental.tenant.createdAt,
          rental: {
            _id: rental._id,
            status: rental.status,
            startDate: rental.startDate,
            endDate: rental.endDate,
            rentAmount: rental.rentAmount,
            asset: {
              title: rental.asset?.title,
              category: rental.asset?.category,
              location: rental.asset?.location,
              image: rental.asset?.images?.[0] || '',
            },
          },
        }));
    } else if (req.user.role === 'manager' || req.user.role === 'admin') {
      const rentals = await Rental.find({
        status: { $in: ['active', 'pending'] },
      })
        .populate({
          path: 'tenant',
          select: 'name email phone address bio createdAt',
        })
        .populate({
          path: 'asset',
          select: 'title category location images rentAmount',
        })
        .populate({
          path: 'owner',
          select: 'name email',
        })
        .sort({ createdAt: -1 });

      const seen = new Set();
      tenants = rentals
        .filter((rental) => {
          const tenantId = rental.tenant?._id?.toString();
          if (!tenantId || seen.has(tenantId)) {
            return false;
          }
          seen.add(tenantId);
          return true;
        })
        .map((rental) => ({
          _id: rental.tenant._id,
          name: rental.tenant.name,
          email: rental.tenant.email,
          phone: rental.tenant.phone || '—',
          address: rental.tenant.address || '—',
          bio: rental.tenant.bio || '',
          joinedOn: rental.tenant.createdAt,
          owner: rental.owner?.name || '—',
          rental: {
            _id: rental._id,
            status: rental.status,
            startDate: rental.startDate,
            endDate: rental.endDate,
            rentAmount: rental.rentAmount,
            asset: {
              title: rental.asset?.title,
              category: rental.asset?.category,
              location: rental.asset?.location,
              image: rental.asset?.images?.[0] || '',
            },
          },
        }));
    }

    return res.status(200).json(tenants);
  } catch (error) {
    console.error('getTenants error:', error);
    return res.status(500).json({ message: error.message });
  }
};

exports.getTenantById = async (req, res, next) => {
  try {
    const tenant = await Tenant.findById(req.params.id)
      .populate('assignedAsset', 'title')
      .populate('assignedBy', 'name email');

    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    return res.json({
      success: true,
      message: 'Tenant fetched',
      data: tenant,
    });
  } catch (error) {
    return next(error);
  }
};

exports.createTenant = async (req, res, next) => {
  try {
    const payload = {
      ...req.body,
      assignedBy: req.user.id,
    };

    const tenant = await Tenant.create(payload);

    return res.status(201).json({
      success: true,
      message: 'Tenant created',
      data: tenant,
    });
  } catch (error) {
    return next(error);
  }
};

exports.updateTenant = async (req, res, next) => {
  try {
    const update = {
      name: req.body.name,
      phone: req.body.phone,
      email: req.body.email,
      assignedAsset: req.body.assignedAsset,
      isActive: req.body.isActive,
    };

    const tenant = await Tenant.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });

    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    return res.json({
      success: true,
      message: 'Tenant updated',
      data: tenant,
    });
  } catch (error) {
    return next(error);
  }
};

exports.deleteTenant = async (req, res, next) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    const hasActiveRental = await Rental.exists({ tenant: tenant.user, status: 'active' });
    if (hasActiveRental) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove tenant with active rental',
      });
    }

    await tenant.deleteOne();

    return res.json({
      success: true,
      message: 'Tenant removed',
    });
  } catch (error) {
    return next(error);
  }
};
