const Asset = require('../models/Asset');
const Rental = require('../models/Rental');
const Payment = require('../models/Payment');

exports.getAllRentals = async (req, res, next) => {
  try {
    const filter = {};

    if (req.user.role === 'owner') {
      filter.owner = req.user.id;
    }

    if (req.user.role === 'tenant') {
      filter.tenant = req.user.id;
    }

    const rentals = await Rental.find(filter)
      .populate('asset', 'title category location images rentAmount')
      .populate('tenant', 'name email phone')
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 });

    const valid = rentals.filter((rental) => rental.tenant && rental.asset);

    return res.status(200).json(valid);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getRentalById = async (req, res, next) => {
  try {
    const rental = await Rental.findById(req.params.id)
      .populate('asset')
      .populate('tenant', 'name email phone')
      .populate('owner', 'name email phone');

    if (!rental) {
      return res.status(404).json({ success: false, message: 'Rental not found' });
    }

    if (req.user.role === 'tenant' && String(rental.tenant._id) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    if (req.user.role === 'owner' && String(rental.owner._id) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    return res.json({ success: true, message: 'Rental fetched', data: rental });
  } catch (error) {
    return next(error);
  }
};

exports.getMyRental = async (req, res) => {
  try {
    const rental = await Rental.findOne({
      tenant: req.user.id,
      status: 'active',
    })
      .populate({
        path: 'asset',
        select: 'title category subType location rentAmount rentPer status images description',
      })
      .populate({
        path: 'owner',
        select: 'name email phone',
      })
      .populate({
        path: 'tenant',
        select: 'name email phone',
      });

    if (!rental) {
      return res.status(200).json(null);
    }

    return res.status(200).json(rental);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.createRental = async (req, res, next) => {
  try {
    const {
      asset: assetId,
      tenant,
      startDate,
      endDate,
      rentAmount,
      securityDeposit,
      terms,
    } = req.body;

    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: 'startDate must be before endDate',
      });
    }

    const asset = await Asset.findById(assetId);
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    if (asset.status !== 'vacant') {
      return res.status(400).json({ success: false, message: 'Asset is not vacant' });
    }

    const rental = await Rental.create({
      asset: asset._id,
      tenant,
      owner: req.user.id,
      startDate,
      endDate,
      rentAmount,
      securityDeposit,
      terms,
      status: 'active',
    });

    asset.status = 'occupied';
    asset.currentTenant = tenant;
    await asset.save();

    const populated = await Rental.findById(rental._id)
      .populate('asset', 'title category images')
      .populate('tenant', 'name email');

    return res.status(201).json({
      success: true,
      message: 'Rental created',
      data: populated,
    });
  } catch (error) {
    return next(error);
  }
};

exports.requestRental = async (req, res) => {
  try {
    const { assetId, asset, startDate, endDate, rentAmount, terms } = req.body;
    const resolvedAssetId = assetId || asset;

    if (!resolvedAssetId) {
      return res.status(400).json({ message: 'Asset ID is required' });
    }

    const assetDoc = await Asset.findById(resolvedAssetId);
    if (!assetDoc) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    if (assetDoc.status !== 'vacant') {
      return res.status(400).json({ message: 'This asset is not available for rent' });
    }

    const existing = await Rental.findOne({
      asset: resolvedAssetId,
      tenant: req.user.id,
      status: { $in: ['active', 'pending'] },
    });

    if (existing) {
      return res.status(400).json({
        message: 'You already have an active or pending request for this asset',
      });
    }

    const rental = await Rental.create({
      asset: assetDoc._id,
      tenant: req.user.id,
      owner: assetDoc.owner,
      startDate: startDate || new Date(),
      endDate: endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      rentAmount: rentAmount || assetDoc.rentAmount,
      securityDeposit: 0,
      terms: terms || 'Pending owner approval',
      status: 'pending',
    });

    return res.status(201).json({
      message: 'Rental request sent to owner',
      rental,
    });
  } catch (error) {
    console.error('requestRental error:', error);
    return res.status(500).json({ message: error.message });
  }
};

exports.getPendingRentals = async (req, res) => {
  try {
    const filter = { status: 'pending' };

    if (req.user.role === 'owner') {
      filter.owner = req.user.id;
    }

    const rentals = await Rental.find(filter)
      .populate('asset', 'title category subType location rentAmount images status')
      .populate('tenant', 'name email phone createdAt')
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 });

    const valid = rentals.filter((rental) => rental.tenant && rental.asset);

    return res.status(200).json(valid);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.approveRental = async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id)
      .populate('asset')
      .populate('tenant', 'name email');

    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }

    if (req.user.role === 'owner' && String(rental.owner) !== String(req.user.id)) {
      return res.status(403).json({ message: 'You can only approve your own requests' });
    }

    if (rental.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending rentals can be approved' });
    }

    rental.status = 'active';
    await rental.save();

    // Remove old pending payments first
    await Payment.deleteMany({
      rental: rental._id,
      status: 'pending',
    });

    await Asset.findByIdAndUpdate(rental.asset._id, {
      status: 'occupied',
      currentTenant: rental.tenant._id,
    });

    // Create first payment
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    await Payment.create({
      rental: rental._id,
      tenant: rental.tenant._id || rental.tenant,
      owner: rental.owner,
      amount: rental.rentAmount,
      dueDate,
      method: 'other',
      status: 'pending',
      note: 'First month rent',
      receiptId: '',
    });

    console.log('First payment created for tenant');

    return res.status(200).json({
      message: 'Rental approved successfully',
      rental,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.rejectRental = async (req, res) => {
  try {
    const { reason } = req.body;

    const rental = await Rental.findById(req.params.id);
    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }

    if (req.user.role === 'owner' && String(rental.owner) !== String(req.user.id)) {
      return res.status(403).json({ message: 'You can only reject your own requests' });
    }

    if (rental.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending rentals can be rejected' });
    }

    rental.status = 'cancelled';
    rental.terms = reason ? `Rejected: ${reason}` : 'Rejected by owner';
    await rental.save();

    return res.status(200).json({
      message: 'Rental rejected',
      rental,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.updateRental = async (req, res, next) => {
  try {
    const rental = await Rental.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('asset', 'title category images')
      .populate('tenant', 'name email');

    if (!rental) {
      return res.status(404).json({ success: false, message: 'Rental not found' });
    }

    return res.json({ success: true, message: 'Rental updated', data: rental });
  } catch (error) {
    return next(error);
  }
};

exports.terminateRental = async (req, res, next) => {
  try {
    const rental = await Rental.findById(req.params.id);
    if (!rental) {
      return res.status(404).json({ success: false, message: 'Rental not found' });
    }

    rental.status = 'terminated';
    await rental.save();

    await Asset.findByIdAndUpdate(rental.asset, {
      status: 'vacant',
      currentTenant: null,
    });

    const updated = await Rental.findById(rental._id)
      .populate('asset', 'title category images')
      .populate('tenant', 'name email');

    return res.json({
      success: true,
      message: 'Rental terminated',
      data: updated,
    });
  } catch (error) {
    return next(error);
  }
};

exports.deleteRental = async (req, res, next) => {
  try {
    const rental = await Rental.findById(req.params.id);
    if (!rental) {
      return res.status(404).json({ success: false, message: 'Rental not found' });
    }

    await rental.deleteOne();

    return res.json({
      success: true,
      message: 'Rental deleted',
    });
  } catch (error) {
    return next(error);
  }
};
