import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"


// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

export const uploadToCloudinary=async (filePath)=>{
    try {
        if(!filePath){
            console.log("No file path provided for upload.");
            return null;
        }
        const response=await cloudinary.uploader.upload(filePath,{
            resource_type:"auto",
        })
        console.log("Upload successful:", response.url);
        return response;
    } catch (error) {
        console.error("Error uploading to Cloudinary:", error);
        return null;
    }
    finally{
        try {
            fs.unlinkSync(filePath);
        } catch (error) {
            console.error("Error deleting temporary file:", error);
        }
    }
}