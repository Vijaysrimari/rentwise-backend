const multer = require("multer");

// Use memory storage for Vercel
// (no file system access needed)
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = allowed.test(
      file.originalname.toLowerCase()
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
