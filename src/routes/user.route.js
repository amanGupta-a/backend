import { Router } from "express";
import { registerUser} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
const router=Router();
router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1,
        },
        {
            name:"coverImage",
            maxCount:1,
        }
    ]),
    registerUser
);
//control gets from http://localhost:5000/user/register
// router.route("/login").get(loginUser);
//control gets from http://localhost:5000/user/login    
export default router;