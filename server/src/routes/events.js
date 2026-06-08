const router = require('express').Router();
const c = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/auth');
const { makeUpload } = require('../config/cloudinary');

const upload = makeUpload('event-banners', ['jpg', 'jpeg', 'png', 'webp']);

router.get('/', c.getEvents);
router.get('/:id', c.getEvent);
router.post('/:id/register', protect, c.registerEvent);
router.post('/:id/save', protect, c.saveEvent);
router.post('/', protect, authorize('admin', 'lecturer'), upload.single('bannerImage'), c.createEvent);
router.put('/:id', protect, authorize('admin', 'lecturer'), c.updateEvent);
router.delete('/:id', protect, authorize('admin'), c.deleteEvent);

module.exports = router;
