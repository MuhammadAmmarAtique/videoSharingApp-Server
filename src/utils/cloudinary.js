import { v2 as cloudinary } from "cloudinary";
import fs from "fs"; //built-in file system library of node.js, no need to install

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const uploadOnCloudinary = async (filePath) => {
  try {
    if (!filePath) return null;
    //uploading file on cloudinary
    const response = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto", //is it image/video/audio, we set auto to check automatically
    });
    // Remove the locally saved temporary file after successful upload
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    console.log("File uploaded Successfully on Cloudinary! ", response.url);
    return response;
  }
  catch (error) {
    console.log("File upload failed on Cloudinary! ", error);
  }
};

export { uploadOnCloudinary };
