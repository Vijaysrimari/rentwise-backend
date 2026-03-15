const Asset = require('../models/Asset');
const SupportRequest = require('../models/SupportRequest');

exports.getAllRequests = async (req, res, next) => {
  try {
    const filter = {};

    if (req.user.role === 'tenant') {
      filter.tenant = req.user.id;
    }

    if (req.user.role === 'owner') {
      const ownerAssets = await Asset.find({ owner: req.user.id }).select('_id');
      filter.asset = { $in: ownerAssets.map((asset) => asset._id) };
    }

    const requests = await SupportRequest.find(filter)
      .populate('tenant', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json(requests);
  } catch (error) {
    return next(error);
  }
};

exports.createRequest = async (req, res, next) => {
  try {
    const { title, desc, category, priority } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const request = await SupportRequest.create({
      tenant: req.user.id,
      title: title.trim(),
      desc: desc?.trim() || '',
      category: category || 'general',
      priority: priority || 'medium',
      status: 'open',
    });

    const populated = await request.populate('tenant', 'name email');

    return res.status(201).json(populated);
  } catch (error) {
    return next(error);
  }
};

exports.updateRequest = async (req, res, next) => {
  try {
    const update = {
      status: req.body.status,
      assignedTo: req.body.assignedTo,
    };

    if (req.body.status === 'resolved') {
      update.resolvedAt = new Date();
    }

    const request = await SupportRequest.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    })
      .populate('tenant', 'name email')
      .populate('assignedTo', 'name email role');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Support request not found' });
    }

    return res.json({
      success: true,
      message: 'Support request updated',
      data: request,
    });
  } catch (error) {
    return next(error);
  }
};

exports.deleteRequest = async (req, res, next) => {
  try {
    const request = await SupportRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Support request not found' });
    }

    await request.deleteOne();

    return res.json({
      success: true,
      message: 'Support request deleted',
    });
  } catch (error) {
    return next(error);
  }
};
