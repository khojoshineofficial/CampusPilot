const Advertisement = require('../models/Advertisement');

exports.createAdvertisement = async (req, res) => {
  try {
    const data = { ...req.body, createdBy: req.user._id, status: 'pending' };
    if (req.file) data.image = req.file.path;
    const ad = await Advertisement.create(data);
    res.status(201).json({ success: true, advertisement: ad });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAdvertisements = async (req, res) => {
  try {
    const { placement, plan, status = 'active' } = req.query;
    const query = { status };
    if (placement) query.placement = placement;
    if (plan) query.plan = plan;

    const ads = await Advertisement.find(query).sort('-createdAt')
      .populate('createdBy', 'name avatar');
    res.json({ success: true, advertisements: ads });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPendingAdvertisements = async (req, res) => {
  try {
    const ads = await Advertisement.find({ status: 'pending' }).sort('-createdAt')
      .populate('createdBy', 'name email');
    res.json({ success: true, advertisements: ads });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.approveAdvertisement = async (req, res) => {
  try {
    const ad = await Advertisement.findByIdAndUpdate(
      req.params.id,
      { status: 'active', approvedBy: req.user._id, startDate: new Date() },
      { new: true }
    );
    res.json({ success: true, advertisement: ad });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.rejectAdvertisement = async (req, res) => {
  try {
    const ad = await Advertisement.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected', rejectionReason: req.body.reason },
      { new: true }
    );
    res.json({ success: true, advertisement: ad });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.trackImpression = async (req, res) => {
  try {
    await Advertisement.findByIdAndUpdate(req.params.id, { $inc: { impressions: 1 } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.trackClick = async (req, res) => {
  try {
    await Advertisement.findByIdAndUpdate(req.params.id, { $inc: { clicks: 1 } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
