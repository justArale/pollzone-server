const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
  secure: true,
});

const polloptionsStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    allowed_formats: ["jpg", "png", "webm", "jpeg"],
    folder: "pollzone/option-image", // The name of the folder in cloudinary for poll options
    //resource_type: "raw", // This is in case you want to upload other types of files, not just images
  },
});

const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    allowed_formats: ["jpg", "png", "webm", "jpeg"],
    folder: "pollzone/avatar", // The name of the folder in cloudinary for avatars
    // resource_type: "raw", // This is in case you want to upload other types of files, not just images
  },
});

// Create different multer instances for each type of upload
const polloptionsUploader = multer({ storage: polloptionsStorage });
const avatarUploader = multer({ storage: avatarStorage });

module.exports = {
  polloptionsUploader,
  avatarUploader,
};
