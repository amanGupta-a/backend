import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
export const uploadToCloudinary = async (filePath) => {
  try {
    if (!filePath) {
      console.log("No filePath received");
      return null;
    }

    console.log("Uploading file:", filePath);

    const response = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });

    return response;

  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return null;

  } finally {
    // ✅ only delete if file exists
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log("Temp file deleted:", filePath);
    } else {
      console.log("File not found, skip delete:", filePath);
    }
  }
};
