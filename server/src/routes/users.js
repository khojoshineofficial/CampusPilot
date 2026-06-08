const router = require('express').Router();
const { getAllUsers, getUser, approveUser, suspendUser, unsuspendUser, deleteUser, updateUserRole } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', authorize('admin'), getAllUsers);
router.get('/:id', getUser);
router.put('/:id/approve', authorize('admin'), approveUser);
router.put('/:id/suspend', authorize('admin'), suspendUser);
router.put('/:id/unsuspend', authorize('admin'), unsuspendUser);
router.put('/:id/role', authorize('admin'), updateUserRole);
router.delete('/:id', authorize('admin'), deleteUser);

module.exports = router;
