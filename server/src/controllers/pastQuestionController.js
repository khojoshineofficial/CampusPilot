const PastQuestion = require('../models/PastQuestion');

exports.getPastQuestions = async (req, res) => {
  try {
    const { department, level, year, semester, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (department) filter.department = department;
    if (level) filter.level = level;
    if (year) filter.year = year;
    if (semester) filter.semester = semester;
    if (search) filter.$text = { $search: search };
    const pqs = await PastQuestion.find(filter)
      .populate('uploadedBy', 'fullname role')
      .skip((page - 1) * limit)
      .limit(+limit)
      .sort('-createdAt');
    const total = await PastQuestion.countDocuments(filter);
    res.json({ success: true, pastQuestions: pqs, total, page: +page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPastQuestion = async (req, res) => {
  try {
    const pq = await PastQuestion.findById(req.params.id).populate('uploadedBy', 'fullname');
    if (!pq) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, pastQuestion: pq });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createPastQuestion = async (req, res) => {
  try {
    const data = { ...req.body, uploadedBy: req.user._id };
    if (req.file) data.fileUrl = req.file.path;
    const pq = await PastQuestion.create(data);
    res.status(201).json({ success: true, pastQuestion: pq });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deletePastQuestion = async (req, res) => {
  try {
    await PastQuestion.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.downloadPastQuestion = async (req, res) => {
  try {
    const pq = await PastQuestion.findByIdAndUpdate(req.params.id, { $inc: { downloads: 1 } }, { new: true });
    res.json({ success: true, fileUrl: pq.fileUrl });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.favoriteToggle = async (req, res) => {
  try {
    const pq = await PastQuestion.findById(req.params.id);
    const idx = pq.favorites.indexOf(req.user._id);
    if (idx > -1) pq.favorites.splice(idx, 1);
    else pq.favorites.push(req.user._id);
    await pq.save();
    res.json({ success: true, favorited: idx === -1 });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
