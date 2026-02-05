import mongoose from "mongoose";
import { db_name } from "../constants.js";
export const connectDB=async ()=>{
    try {
        const connectionInstance=await mongoose.connect(`${process.env.MONGODB_URI}/${db_name}`);
        console.log(`\n MongoDB connected !!! \n DBHost: ${connectionInstance.connection.host} \n DBName: ${connectionInstance.connection.name}`);
        // console.log(connectionInstance);
        console.log("Hello World")
    } catch (error) {
        console.error("Error: Connection Failed",  error);
        process.exit(1);
    }
}
