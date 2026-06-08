const Material = require('../models/Material');

exports.getMaterials = async (req, res) => {
  try {
    const { department, level, course, type, search, page = 1, limit = 20 } = req.query;
    const filter = { isPublished: true };
    if (department) filter.department = department;
    if (level) filter.level = level;
    if (course) filter.course = new RegExp(course, 'i');
    if (type) filter.type = type;
    if (search) filter.$text = { $search: search };
    const materials = await Material.find(filter)
      .populate('uploadedBy', 'fullname role')
      .skip((page - 1) * limit)
      .limit(+limit)
      .sort('-createdAt');
    const total = await Material.countDocuments(filter);
    res.json({ success: true, materials, total, page: +page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyMaterials = async (req, res) => {
  try {
    const materials = await Material.find({ uploadedBy: req.user._id }).sort('-createdAt');
    res.json({ success: true, materials });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMaterial = async (req, res) => {
  try {
    const m = await Material.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true })
      .populate('uploadedBy', 'fullname role');
    if (!m) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, material: m });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createMaterial = async (req, res) => {
  try {
    const data = { ...req.body, uploadedBy: req.user._id };
    if (req.file) data.fileUrl = req.file.path;
    const material = await Material.create(data);
    res.status(201).json({ success: true, material });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateMaterial = async (req, res) => {
  try {
    const material = await Material.findOneAndUpdate(
      { _id: req.params.id, uploadedBy: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!material) return res.status(404).json({ success: false, message: 'Not found or unauthorized' });
    res.json({ success: true, material });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteMaterial = async (req, res) => {
  try {
    const filter = req.user.role === 'admin'
      ? { _id: req.params.id }
      : { _id: req.params.id, uploadedBy: req.user._id };
    await Material.findOneAndDelete(filter);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.downloadMaterial = async (req, res) => {
  try {
    const m = await Material.findByIdAndUpdate(req.params.id, { $inc: { downloads: 1 } }, { new: true });
    res.json({ success: true, fileUrl: m.fileUrl });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
