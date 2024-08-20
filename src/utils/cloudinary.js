import { v2 as cloudinary } from "cloudinary";
import fs from "fs"; //built-in file system library of node.js, no need to install

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
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
      fs.unlinkSync(filePath); //comment these 2 lines to see files inside public directory.
    }
    console.log("File uploaded Successfully on Cloudinary! ");
    return response;
  } catch (error) {
    console.log("File uploading failed on Cloudinary! ", error);
  }
};

const deleteFromCloudinary = async (fileUrl) => {
  try {
    function extractPublicIdFromUrl(url) {
      // Extract the substring after the last '/'
      const publicIdWithExtension = url.substring(url.lastIndexOf("/") + 1);
      // Remove the file extension (e.g., .jpg, mp4)
      const publicId = publicIdWithExtension.split(".")[0];
      return publicId;
    }
    const filePublicId = extractPublicIdFromUrl(fileUrl);

    if (!filePublicId) return null;
    await cloudinary.uploader.destroy(filePublicId);

    console.log("Successfully deleted File from Cloudinary! ");
  } 
  catch (error) {
    console.log(
      "File deletion from Cloudinary failed! ",
      error
    );
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
