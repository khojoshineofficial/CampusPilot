const Event = require('../models/Event');
const Project = require('../models/Project');
const CommunityPost = require('../models/CommunityPost');
const Advertisement = require('../models/Advertisement');
const User = require('../models/User');
const EventRegistration = require('../models/EventRegistration');

exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers, totalEvents, totalProjects, totalPosts,
      pendingEvents, pendingProjects, pendingAds,
      totalRegistrations,
    ] = await Promise.all([
      User.countDocuments(),
      Event.countDocuments({ status: 'approved' }),
      Project.countDocuments({ status: 'approved' }),
      CommunityPost.countDocuments({ isPublished: true }),
      Event.countDocuments({ status: 'pending' }),
      Project.countDocuments({ status: 'pending' }),
      Advertisement.countDocuments({ status: 'pending' }),
      EventRegistration.countDocuments(),
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers, totalEvents, totalProjects, totalPosts,
        pendingEvents, pendingProjects, pendingAds, totalRegistrations,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getEventAnalytics = async (req, res) => {
  try {
    const events = await Event.aggregate([
      { $match: { status: 'approved' } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalViews: { $sum: '$views' },
          totalRegistrations: { $sum: '$registrationCount' },
          totalAttendance: { $sum: '$attendanceCount' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const topEvents = await Event.find({ status: 'approved' })
      .sort('-views')
      .limit(10)
      .select('title views registrationCount attendanceCount category date');

    res.json({ success: true, byCategory: events, topEvents });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getProjectAnalytics = async (req, res) => {
  try {
    const byCategory = await Project.aggregate([
      { $match: { status: 'approved' } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalViews: { $sum: '$views' },
          totalLikes: { $sum: '$likeCount' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const topProjects = await Project.find({ status: 'approved' })
      .sort('-views')
      .limit(10)
      .select('name views likeCount bookmarkCount shareCount category');

    res.json({ success: true, byCategory, topProjects });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAdAnalytics = async (req, res) => {
  try {
    const ads = await Advertisement.find({ status: { $in: ['active', 'expired'] } })
      .select('title plan impressions clicks conversions status createdAt')
      .sort('-impressions');
    res.json({ success: true, advertisements: ads });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getTrendingTopics = async (req, res) => {
  try {
    const trending = await CommunityPost.aggregate([
      { $match: { isPublished: true } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 }, totalLikes: { $sum: '$likeCount' } } },
      { $sort: { count: -1, totalLikes: -1 } },
      { $limit: 20 },
    ]);

    res.json({ success: true, topics: trending });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getActiveUsers = async (req, res) => {
  try {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const users = await User.find({ lastSeen: { $gte: since } })
      .select('name avatar role lastSeen department')
      .sort('-lastSeen')
      .limit(20);
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
