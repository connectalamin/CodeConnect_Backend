// multer.config.js
import multer from 'multer';

// Store files in memory (we'll upload directly to Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({ storage });

export default upload;