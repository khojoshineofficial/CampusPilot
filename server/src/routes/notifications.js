const router = require('express').Router();
const c = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, c.getNotifications);
router.post('/', protect, authorize('admin'), c.createNotification);
router.put('/:id/read', protect, c.markRead);
router.put('/read-all', protect, c.markAllRead);
router.delete('/:id', protect, authorize('admin'), c.deleteNotification);

module.exports = router;
