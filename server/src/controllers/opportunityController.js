const Opportunity = require('../models/Opportunity');

exports.getOpportunities = async (req, res) => {
  try {
    const { type, search, page = 1, limit = 20 } = req.query;
    const filter = { isApproved: true };
    if (type) filter.type = type;
    if (search) filter.$text = { $search: search };
    const opportunities = await Opportunity.find(filter)
      .populate('createdBy', 'fullname role')
      .skip((page - 1) * limit)
      .limit(+limit)
      .sort('-createdAt');
    const total = await Opportunity.countDocuments(filter);
    res.json({ success: true, opportunities, total, page: +page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPendingOpportunities = async (req, res) => {
  try {
    const opportunities = await Opportunity.find({ isApproved: false })
      .populate('createdBy', 'fullname role');
    res.json({ success: true, opportunities });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getOpportunity = async (req, res) => {
  try {
    const opp = await Opportunity.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true })
      .populate('createdBy', 'fullname');
    if (!opp) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, opportunity: opp });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createOpportunity = async (req, res) => {
  try {
    const data = { ...req.body, createdBy: req.user._id };
    if (req.file) data.imageUrl = req.file.path;
    const isAdmin = req.user.role === 'admin';
    if (isAdmin) data.isApproved = true;
    const opp = await Opportunity.create(data);
    res.status(201).json({ success: true, opportunity: opp });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.approveOpportunity = async (req, res) => {
  try {
    const opp = await Opportunity.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
    res.json({ success: true, opportunity: opp });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteOpportunity = async (req, res) => {
  try {
    await Opportunity.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.saveOpportunity = async (req, res) => {
  try {
    const opp = await Opportunity.findById(req.params.id);
    const idx = opp.saved.indexOf(req.user._id);
    if (idx > -1) opp.saved.splice(idx, 1);
    else opp.saved.push(req.user._id);
    await opp.save();
    res.json({ success: true, saved: idx === -1 });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
