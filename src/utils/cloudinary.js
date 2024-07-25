import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      fs.unlinkSync(localFilePath);
      return null;
    } else {
      const response = await cloudinary.uploader.upload(localFilePath, {
        resource_type: "auto",
      });

      fs.unlinkSync(localFilePath);
      return response;
    }
  } catch (error) {
    fs.unlinkSync(localFilePath);
    return null;
  }
};

const deleteFromCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      return null;
    } else {
      const imageUrl = localFilePath.split("/");
      const image = imageUrl[imageUrl.length - 1];
      const imageName = image.split(".")[0];

      const response = await cloudinary.uploader.destroy(imageName);
      return response;
    }
  } catch (error) {
    return null;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
