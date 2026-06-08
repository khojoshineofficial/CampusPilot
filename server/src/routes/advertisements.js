const router = require('express').Router();
const ctrl = require('../controllers/advertisementController');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

const setFolder = (req, res, next) => { req.uploadFolder = 'campuspilot/ads'; next(); };

router.get('/', ctrl.getAdvertisements);
router.get('/pending', protect, authorize('admin'), ctrl.getPendingAdvertisements);
router.post('/', protect, setFolder, upload.single('image'), ctrl.createAdvertisement);
router.put('/:id/approve', protect, authorize('admin'), ctrl.approveAdvertisement);
router.put('/:id/reject', protect, authorize('admin'), ctrl.rejectAdvertisement);
router.post('/:id/impression', ctrl.trackImpression);
router.post('/:id/click', ctrl.trackClick);

module.exports = router;
