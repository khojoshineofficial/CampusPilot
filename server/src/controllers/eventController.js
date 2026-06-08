const Event = require('../models/Event');
const EventRegistration = require('../models/EventRegistration');
const generateSlug = require('../utils/slugify');
const createNotification = require('../utils/notify');
const crypto = require('crypto');

exports.createEvent = async (req, res) => {
  try {
    const data = { ...req.body, createdBy: req.user._id };
    if (req.file) data.bannerImage = req.file.path;
    data.slug = generateSlug(data.title);
    data.organizer = data.organizer || { name: req.user.name, user: req.user._id };
    data.status = 'pending';

    const event = await Event.create(data);
    res.status(201).json({ success: true, event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getEvents = async (req, res) => {
  try {
    const { page = 1, limit = 12, category, status = 'approved', search, featured, sort = '-date' } = req.query;
    const query = { status };
    if (category) query.category = category;
    if (featured) query.isFeatured = true;
    if (search) query.$text = { $search: search };

    const skip = (Number(page) - 1) * Number(limit);
    const [events, total] = await Promise.all([
      Event.find(query).sort(sort).skip(skip).limit(Number(limit)).populate('createdBy', 'name avatar role'),
      Event.countDocuments(query),
    ]);

    res.json({ success: true, events, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findOne({ $or: [{ _id: req.params.id }, { slug: req.params.id }] })
      .populate('createdBy', 'name avatar role department');
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    event.views += 1;
    await event.save();

    res.json({ success: true, event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    const isOwner = event.createdBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) return res.status(403).json({ success: false, message: 'Access denied' });

    if (req.file) req.body.bannerImage = req.file.path;
    const updated = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, event: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    const isOwner = event.createdBy.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Access denied' });

    await event.deleteOne();
    res.json({ success: true, message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.approveEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { status: 'approved', approvedBy: req.user._id, approvedAt: Date.now() },
      { new: true }
    );
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    const io = req.app.get('io');
    await createNotification({
      recipient: event.createdBy,
      sender: req.user._id,
      type: 'event_approved',
      title: 'Event Approved',
      message: `Your event "${event.title}" has been approved and is now live.`,
      link: `/events/${event.slug}`,
      onModel: 'Event',
      onDocument: event._id,
      io,
    });

    res.json({ success: true, event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.rejectEvent = async (req, res) => {
  try {
    const { reason } = req.body;
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected', rejectionReason: reason },
      { new: true }
    );
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    const io = req.app.get('io');
    await createNotification({
      recipient: event.createdBy,
      type: 'event_rejected',
      title: 'Event Rejected',
      message: `Your event "${event.title}" was rejected. Reason: ${reason}`,
      onModel: 'Event',
      onDocument: event._id,
      io,
    });

    res.json({ success: true, event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.featureEvent = async (req, res) => {
  try {
    const { isFeatured, featuredPlacement } = req.body;
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { isFeatured, featuredPlacement },
      { new: true }
    );
    res.json({ success: true, event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event || event.status !== 'approved') {
      return res.status(404).json({ success: false, message: 'Event not found or not available' });
    }

    const existing = await EventRegistration.findOne({ event: event._id, user: req.user._id });
    if (existing) return res.status(400).json({ success: false, message: 'Already registered' });

    const qrToken = crypto.randomBytes(32).toString('hex');
    const registration = await EventRegistration.create({
      event: event._id,
      user: req.user._id,
      name: req.body.name || req.user.name,
      email: req.body.email || req.user.email,
      phone: req.body.phone,
      qrToken,
    });

    event.registrationCount += 1;
    await event.save();

    res.status(201).json({ success: true, registration });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.checkInAttendance = async (req, res) => {
  try {
    const { qrToken } = req.body;
    const registration = await EventRegistration.findOne({ qrToken });
    if (!registration) return res.status(404).json({ success: false, message: 'Invalid QR token' });

    registration.attended = true;
    registration.checkedInAt = Date.now();
    await registration.save();

    const event = await Event.findById(registration.event);
    event.attendanceCount += 1;
    await event.save();

    res.json({ success: true, message: 'Check-in successful', registration });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ createdBy: req.user._id }).sort('-createdAt');
    res.json({ success: true, events });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPendingEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: 'pending' }).sort('-createdAt')
      .populate('createdBy', 'name email role');
    res.json({ success: true, events });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
