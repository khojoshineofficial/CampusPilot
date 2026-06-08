const router = require('express').Router();
const c = require('../controllers/materialController');
const { protect, authorize } = require('../middleware/auth');
const { makeUpload } = require('../config/cloudinary');

const upload = makeUpload('materials', ['pdf', 'ppt', 'pptx', 'doc', 'docx', 'mp4', 'mp3', 'jpg', 'jpeg', 'png']);

router.get('/', protect, c.getMaterials);
router.get('/mine', protect, authorize('lecturer', 'admin'), c.getMyMaterials);
router.get('/:id', protect, c.getMaterial);
router.post('/:id/download', protect, c.downloadMaterial);
router.post('/', protect, authorize('admin', 'lecturer'), upload.single('file'), c.createMaterial);
router.put('/:id', protect, authorize('admin', 'lecturer'), c.updateMaterial);
router.delete('/:id', protect, authorize('admin', 'lecturer'), c.deleteMaterial);

module.exports = router;
