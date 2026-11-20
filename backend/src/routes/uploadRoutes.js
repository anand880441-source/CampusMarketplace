const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");
const { uploadImages } = require("../controllers/uploadController");

const uploadImagesMiddleware = upload.array("images", 4);

router.post("/", auth, (req, res) => {
  uploadImagesMiddleware(req, res, (error) => {
    if (error) {
      let message = error.message;
      if (error.code === "LIMIT_FILE_SIZE") {
        message = "Each image must be 5 MB or smaller";
      } else if (error.code === "LIMIT_FILE_COUNT" || error.code === "LIMIT_UNEXPECTED_FILE") {
        message = "You can upload up to 4 images";
      }

      return res.status(400).json({ success: false, message });
    }

    uploadImages(req, res);
  });
});

module.exports = router;
