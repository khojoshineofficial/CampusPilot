const router = require('express').Router();
const ctrl = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.get('/', protect, ctrl.getNotifications);
router.put('/read-all', protect, ctrl.markAllAsRead);
router.put('/:id/read', protect, ctrl.markAsRead);
router.delete('/:id', protect, ctrl.deleteNotification);

module.exports = router;
