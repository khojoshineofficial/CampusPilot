const router = require('express').Router();
const c = require('../controllers/announcementController');
const { protect, authorize } = require('../middleware/auth');
const { makeUpload } = require('../config/cloudinary');

const upload = makeUpload('announcements', ['pdf', 'jpg', 'jpeg', 'png']);

router.get('/', protect, c.getAnnouncements);
router.post('/', protect, authorize('admin', 'lecturer'), upload.single('attachment'), c.createAnnouncement);
router.put('/:id', protect, authorize('admin', 'lecturer'), c.updateAnnouncement);
router.delete('/:id', protect, authorize('admin'), c.deleteAnnouncement);
router.post('/:id/view', protect, c.viewAnnouncement);

module.exports = router;
