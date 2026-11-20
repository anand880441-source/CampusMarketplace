const multer = require("multer");
const path = require("path");
const fs = require("fs");

const cloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
);

const uploadDir = path.join(__dirname, "..", "..", "uploads");

if (!cloudinaryConfigured && !fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const extensionByMimeType = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const extension = extensionByMimeType[file.mimetype] || ".jpg";
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  if (!extensionByMimeType[file.mimetype]) {
    return cb(new Error("Only JPG, PNG, WEBP and GIF images are allowed"));
  }
  cb(null, true);
};

const upload = multer({
  storage: cloudinaryConfigured ? multer.memoryStorage() : diskStorage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 4,
  },
});

module.exports = upload;
module.exports.cloudinaryConfigured = cloudinaryConfigured;
