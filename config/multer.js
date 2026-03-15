const multer = require("multer");
const path   = require("path");
const fs     = require("fs");

// Use /tmp for Vercel (only writable directory)
const uploadDir = process.env.NODE_ENV === "production"
  ? "/tmp/uploads/assets"
  : path.join(__dirname, "../uploads/assets");

// Create directory if not exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" +
      Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = allowed.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mime = allowed.test(file.mimetype);
    if (ext && mime) {
      cb(null, true);
    } else {
      cb(new Error("Only images allowed"));
    }
  },
});

module.exports = upload;
