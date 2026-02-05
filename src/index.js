import dotenv from "dotenv";
import { connectDB } from "./db/index.js";
import {app} from "./app.js";

dotenv.config();
connectDB()
.then(
    app.listen(process.env.PORT, ()=>{
        console.log(`Server is running on PORT: ${process.env.PORT}`);
    })
)
.catch((error)=>console.error("Error in DB Connection", error));