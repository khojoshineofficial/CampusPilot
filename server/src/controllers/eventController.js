const Event = require('../models/Event');

exports.getEvents = async (req, res) => {
  try {
    const { category, department, search, page = 1, limit = 20 } = req.query;
    const filter = { isPublished: true };
    if (category) filter.category = category;
    if (department && department !== 'all') filter.targetDepartment = { $in: [department, 'all'] };
    if (search) filter.$or = [
      { title: new RegExp(search, 'i') },
      { description: new RegExp(search, 'i') },
    ];
    const events = await Event.find(filter)
      .populate('createdBy', 'fullname role')
      .skip((page - 1) * limit)
      .limit(+limit)
      .sort('date');
    const total = await Event.countDocuments(filter);
    res.json({ success: true, events, total, page: +page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true })
      .populate('createdBy', 'fullname');
    if (!event) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const data = { ...req.body, createdBy: req.user._id };
    if (req.file) data.bannerImage = req.file.path;
    const event = await Event.create(data);
    res.status(201).json({ success: true, event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.registerEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    const idx = event.registrations.indexOf(req.user._id);
    if (idx > -1) event.registrations.splice(idx, 1);
    else event.registrations.push(req.user._id);
    await event.save();
    res.json({ success: true, registered: idx === -1, count: event.registrations.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.saveEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    const idx = event.saved.indexOf(req.user._id);
    if (idx > -1) event.saved.splice(idx, 1);
    else event.saved.push(req.user._id);
    await event.save();
    res.json({ success: true, saved: idx === -1 });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
