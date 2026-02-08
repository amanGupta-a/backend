import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: "./.env",
});

console.log("ENV loaded:", {
  cloud: process.env.CLOUDINARY_CLOUD_NAME,
  mongo: process.env.MONGODB_URI,
});
