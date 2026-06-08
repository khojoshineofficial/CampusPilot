const router = require('express').Router();
const c = require('../controllers/bookController');
const { protect, authorize } = require('../middleware/auth');
const { makeUpload } = require('../config/cloudinary');
const multer = require('multer');

const upload = makeUpload('books', ['pdf', 'doc', 'docx', 'epub']);
const coverUpload = makeUpload('book-covers', ['jpg', 'jpeg', 'png', 'webp']);

const fields = multer({ storage: upload.storage }).fields([
  { name: 'file', maxCount: 1 },
  { name: 'cover', maxCount: 1 },
]);

router.get('/', c.getBooks);
router.get('/:id', c.getBook);
router.post('/:id/download', protect, c.downloadBook);
router.post('/:id/bookmark', protect, c.bookmarkBook);
router.post('/', protect, authorize('admin', 'lecturer'), fields, c.createBook);
router.put('/:id', protect, authorize('admin', 'lecturer'), c.updateBook);
router.delete('/:id', protect, authorize('admin', 'lecturer'), c.deleteBook);

module.exports = router;
