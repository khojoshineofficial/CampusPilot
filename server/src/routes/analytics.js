const router = require('express').Router();
const ctrl = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

router.get('/dashboard', protect, authorize('admin'), ctrl.getDashboardStats);
router.get('/events', protect, authorize('admin'), ctrl.getEventAnalytics);
router.get('/projects', protect, authorize('admin'), ctrl.getProjectAnalytics);
router.get('/advertisements', protect, authorize('admin'), ctrl.getAdAnalytics);
router.get('/trending-topics', ctrl.getTrendingTopics);
router.get('/active-users', protect, authorize('admin'), ctrl.getActiveUsers);

module.exports = router;
