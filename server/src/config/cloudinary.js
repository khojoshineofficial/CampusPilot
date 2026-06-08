const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const makeUpload = (folder, formats) => {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: { folder: `campuspilot/${folder}`, allowed_formats: formats || ['jpg','jpeg','png','pdf','mp4','mp3','webp','gif','docx','pptx'] },
  });
  return multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });
};

module.exports = { cloudinary, makeUpload };
