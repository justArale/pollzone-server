const router = require("express").Router();
const { polloptionsUploader, avatarUploader } = require("../config/cloudinary");

router.get("/", (req, res, next) => {
  res.json("All good in here");
});

// Route for uploading poll option images
router.post(
  "/api/upload-option-image",
  polloptionsUploader.single("image"),
  (req, res, next) => {
    console.log("file is: ", req.file);

    if (!req.file) {
      next(new Error("No file uploaded!"));
      return;
    }

    res.json({ fileUrl: req.file.path });
  }
);

// Route for uploading avatar images
router.post(
  "/api/upload-avatar",
  avatarUploader.single("image"),
  (req, res, next) => {
    console.log("file is: ", req.file);

    if (!req.file) {
      next(new Error("No file uploaded!"));
      return;
    }

    res.json({ fileUrl: req.file.path });
  }
);

module.exports = router;
