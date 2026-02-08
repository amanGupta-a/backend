import "./config/env.js";
// import dotenv from "dotenv"
// dotenv.config({
//     path:"./.env"
// })
import { connectDB } from "./db/index.js";
import {app} from "./app.js";
connectDB()
.then(
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`Server is running on PORT: ${process.env.PORT || 8000}`);
    })
)
.catch((error)=>console.error("Error in DB Connection", error));

