const router = require('express').Router();
const { getStats } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

router.get('/stats', protect, authorize('admin'), getStats);

module.exports = router;
