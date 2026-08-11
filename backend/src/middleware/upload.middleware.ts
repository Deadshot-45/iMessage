import multer from "multer";

const storage = multer.memoryStorage();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25mb
  },
  fileFilter: (req, file, cb) => {
    const filetypes = [
      "image/png",
      "image/jpeg",
      "image/webp",
      "image/gif",
      "video/mp4",
      "video/webm",
      "video/quicktime",
    ];
    if (!filetypes.includes(file.mimetype)) {
      cb(null, false);
      throw new Error("Invalid file type");
    }
  },
});

export default upload;