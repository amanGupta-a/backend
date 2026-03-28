import { Router } from "express";
import { registerUser, loginUser, logoutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetail, updateAvatar, getUserProfile, updateCoverImage, getUserWatchHistory} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
// import { verify } from "jsonwebtoken";
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
router.route("/login").post(loginUser);
//secured-routes 
router.route("/logout").post(verifyJWT,logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
//control gets from http://localhost:5000/user/register
// router.route("/login").get(loginUser);
//control gets from http://localhost:5000/user/login  
router.route("/change-password").post(verifyJWT,changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/update-account")
.patch(verifyJWT,updateAccountDetail);
router.
route("/update-avatar")
.patch(verifyJWT,upload.single("avatar"),updateAvatar);
router
.route("/update-coverImage").
patch(verifyJWT, upload.single("coverImage"), updateCoverImage);
router.route("/c/:username").get(verifyJWT,getUserProfile);
router.route("/watch-History").get(verifyJWT, getUserWatchHistory);
export default router;