const cloudinary = require("cloudinary").v2;
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const savePicture = async(picture, offerID, folderPath = "/") => {
    console.log(picture);
  try {
    const result = await cloudinary.uploader.upload(picture, {folder:folderPath, public_id:offerID, overwrite: true});
    console.log(result);
    return result;
;
  } catch (error) {
    return res.json({ error: error.message });
  }
};

module.exports = savePicture;
