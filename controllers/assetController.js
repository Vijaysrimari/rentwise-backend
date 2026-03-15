const Asset = require('../models/Asset');
const Rental = require('../models/Rental');

exports.getAllAssets = async (req, res) => {
  try {
    const {
      category,
      status,
      search,
      page = 1,
      limit = 12,
      sort = 'default',
    } = req.query;

    const filter = {};
    if (category && category !== 'All') filter.category = category;
    if (status && status !== 'All') filter.status = status;
    if (search && String(search).trim()) {
      filter.title = { $regex: String(search).trim(), $options: 'i' };
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'low') sortOption = { rentAmount: 1 };
    if (sort === 'high') sortOption = { rentAmount: -1 };

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(50, Math.max(1, Number(limit) || 12));
    const skipNum = (pageNum - 1) * limitNum;

    const [assets, total] = await Promise.all([
      Asset.find(filter)
        .populate('owner', 'name email phone')
        .populate('currentTenant', 'name email')
        .sort(sortOption)
        .skip(skipNum)
        .limit(limitNum)
        .lean(),
      Asset.countDocuments(filter),
    ]);

    return res.status(200).json({
      assets,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      limit: limitNum,
    });
  } catch (err) {
    console.error('getAllAssets error:', err);
    return res.status(500).json({
      message: 'Failed to fetch assets',
      error: err.message,
    });
  }
};

exports.getAssetById = async (req, res, next) => {
  try {
    const asset = await Asset.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('currentTenant', 'name email phone');

    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    return res.json({
      success: true,
      message: 'Asset fetched',
      data: asset,
    });
  } catch (error) {
    return next(error);
  }
};

exports.createAsset = async (req, res, next) => {
  try {
    const payload = {
      ...req.body,
      owner: req.user.id,
    };

    const asset = await Asset.create(payload);

    return res.status(201).json({
      success: true,
      message: 'Asset created',
      data: asset,
    });
  } catch (error) {
    return next(error);
  }
};

exports.updateAsset = async (req, res, next) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    const isOwner = String(asset.owner) === String(req.user.id);
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    Object.assign(asset, req.body);
    const updatedAsset = await asset.save();

    return res.json({
      success: true,
      message: 'Asset updated',
      data: updatedAsset,
    });
  } catch (error) {
    return next(error);
  }
};

exports.deleteAsset = async (req, res, next) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    const isOwner = String(asset.owner) === String(req.user.id);
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const hasActiveRental = await Rental.exists({ asset: asset._id, status: 'active' });
    if (hasActiveRental) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete asset with active rental',
      });
    }

    await asset.deleteOne();

    return res.json({
      success: true,
      message: 'Asset deleted',
    });
  } catch (error) {
    return next(error);
  }
};

exports.uploadAssetImage = async (req, res, next) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    const isOwner = String(asset.owner) === String(req.user.id);
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const files = req.files || [];
    if (!files.length) {
      return res.status(400).json({ success: false, message: 'No images uploaded' });
    }

    const imagePaths = files.map((file) => `/uploads/assets/${file.filename}`);
    asset.images.push(...imagePaths);
    await asset.save();

    return res.json({
      success: true,
      message: 'Asset images uploaded',
      data: asset,
    });
  } catch (error) {
    return next(error);
  }
};
