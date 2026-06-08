const router = require('express').Router();
const ctrl = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, ctrl.createReport);
router.get('/', protect, authorize('admin'), ctrl.getReports);
router.put('/:id/resolve', protect, authorize('admin'), ctrl.resolveReport);
router.put('/users/:userId/suspend', protect, authorize('admin'), ctrl.suspendUser);

module.exports = router;
