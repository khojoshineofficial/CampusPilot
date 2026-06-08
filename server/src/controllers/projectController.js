const Project = require('../models/Project');
const generateSlug = require('../utils/slugify');
const createNotification = require('../utils/notify');

exports.createProject = async (req, res) => {
  try {
    const data = { ...req.body, createdBy: req.user._id, status: 'pending' };
    if (req.file) data.coverImage = req.file.path;
    data.slug = generateSlug(data.name);
    if (typeof data.teamMembers === 'string') data.teamMembers = JSON.parse(data.teamMembers);

    const project = await Project.create(data);
    res.status(201).json({ success: true, project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const { page = 1, limit = 12, category, search, sort = '-createdAt', featured } = req.query;
    const query = { status: 'approved' };
    if (category) query.category = category;
    if (featured === 'true') query.isFeatured = true;
    if (search) query.$text = { $search: search };

    const skip = (Number(page) - 1) * Number(limit);
    const [projects, total] = await Promise.all([
      Project.find(query).sort(sort).skip(skip).limit(Number(limit))
        .populate('createdBy', 'name avatar department'),
      Project.countDocuments(query),
    ]);

    res.json({ success: true, projects, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getProject = async (req, res) => {
  try {
    const project = await Project.findOne({ $or: [{ _id: req.params.id }, { slug: req.params.id }] })
      .populate('createdBy', 'name avatar department faculty');
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    project.views += 1;
    await project.save();

    res.json({ success: true, project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    if (project.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    if (req.file) req.body.coverImage = req.file.path;
    const updated = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, project: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    if (project.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    await project.deleteOne();
    res.json({ success: true, message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.approveProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { status: 'approved', approvedBy: req.user._id },
      { new: true }
    );
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const io = req.app.get('io');
    await createNotification({
      recipient: project.createdBy,
      type: 'project_approved',
      title: 'Project Approved',
      message: `Your project "${project.name}" has been approved and is now public.`,
      link: `/projects/${project.slug}`,
      onModel: 'Project',
      onDocument: project._id,
      io,
    });

    res.json({ success: true, project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.rejectProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    );
    res.json({ success: true, project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPendingProjects = async (req, res) => {
  try {
    const projects = await Project.find({ status: 'pending' }).sort('-createdAt')
      .populate('createdBy', 'name email role');
    res.json({ success: true, projects });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
