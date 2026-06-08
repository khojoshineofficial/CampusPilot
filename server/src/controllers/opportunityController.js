const Opportunity = require('../models/Opportunity');

exports.createOpportunity = async (req, res) => {
  try {
    const data = { ...req.body, createdBy: req.user._id, status: 'pending' };
    if (req.file) data.image = req.file.path;
    const opp = await Opportunity.create(data);
    res.status(201).json({ success: true, opportunity: opp });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getOpportunities = async (req, res) => {
  try {
    const { page = 1, limit = 12, type, search, sort = '-createdAt' } = req.query;
    const query = { status: 'approved' };
    if (type) query.type = type;
    if (search) query.$text = { $search: search };

    const skip = (Number(page) - 1) * Number(limit);
    const [opportunities, total] = await Promise.all([
      Opportunity.find(query).sort(sort).skip(skip).limit(Number(limit))
        .populate('createdBy', 'name avatar'),
      Opportunity.countDocuments(query),
    ]);

    res.json({ success: true, opportunities, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getOpportunity = async (req, res) => {
  try {
    const opp = await Opportunity.findById(req.params.id).populate('createdBy', 'name avatar');
    if (!opp) return res.status(404).json({ success: false, message: 'Not found' });
    opp.views += 1;
    await opp.save();
    res.json({ success: true, opportunity: opp });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.approveOpportunity = async (req, res) => {
  try {
    const opp = await Opportunity.findByIdAndUpdate(
      req.params.id,
      { status: 'approved', approvedBy: req.user._id },
      { new: true }
    );
    res.json({ success: true, opportunity: opp });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.rejectOpportunity = async (req, res) => {
  try {
    const opp = await Opportunity.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    );
    res.json({ success: true, opportunity: opp });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPendingOpportunities = async (req, res) => {
  try {
    const opps = await Opportunity.find({ status: 'pending' }).sort('-createdAt')
      .populate('createdBy', 'name email');
    res.json({ success: true, opportunities: opps });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
