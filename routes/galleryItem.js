const router = require("express").Router();
const multer = require("multer");
const {
  getGalleryItems,
  createGalleryLink,
  uploadGalleryFile,
  deleteGalleryItem,
} = require("../controllers/galleryItem");
const { validateGalleryLink, validateId } = require("../middlewares/validation");
const BadRequestError = require("../errors/BadRequestError");

// Files are held in memory only long enough to stream them to R2 — nothing
// touches this server's disk, which matters since Render's free tier disk
// is ephemeral anyway.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB per file
});

const handleUpload = (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return next(new BadRequestError("File is too large (25MB limit)"));
      }
      return next(new BadRequestError(err.message || "Upload failed"));
    }
    return next();
  });
};

router.get("/", getGalleryItems);
router.post("/link", validateGalleryLink, createGalleryLink);
router.post("/upload", handleUpload, uploadGalleryFile);
router.delete("/:id", validateId, deleteGalleryItem);

module.exports = router;
