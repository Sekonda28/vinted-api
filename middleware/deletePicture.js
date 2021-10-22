const cloudinary = require("cloudinary").v2;
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const deletePicture = async (publicID) => {
  try {
    await cloudinary.uploader.destroy(publicID, (error, result) => {
      console.log(result, error);
    });
  } catch (error) {
    return res.json({ error: error.message });
  }
};

module.exports = deletePicture;
