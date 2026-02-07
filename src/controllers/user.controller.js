import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { upload } from "../middlewares/multer.middleware.js";
import { ApiResponse } from "../utils/ApiResponse.js";
const registerUser=asyncHandler(async (req, res)=>{
    //1,get data from frontend 
    const {fullName, email, username, password}=req.body
    console.log("fullName:", fullName)
    console.log("username:", username)
    console.log("email:", email)
    // if(!fullName||fullName.trim()===""){
    //     throw new ApiError(400, "Full Name Required")
    // }

    //2,validation , do all filed are non empty 
    if([fullName,email,username,password].some((field)=>field?.trim()==="")){
        throw new ApiError(400, "All Field Required")
    }
    //3,checking if already exists
    const userExists=User.findOne({
        $or:[{email}, {username}]
    })
    if(userExists){
        throw new ApiError(409, "This username or email is already register")
    }

    //4,checking for image upload,
    const localAvatar=req.files?.avatar[0]?.path;
    const localCoverImage=req.files?.coverImage[0]?.path;
    if(!localAvatar){throw new ApiError(400,"Avatar is Required")};

    //5,uploading to cloudinary
    const avatar= await uploadToCloudinary(localAvatar);
    const coverImg=await uploadToCloudinary(localCoverImage);
    if(!avatar){
        throw new ApiError(400, "Avatar not UPLOADED to Cloudinary")
    }
    //,6 create user object and store it to db
    const user=await User.create({
        username:username.toLowerCase(),
        email:email.toLowerCase(),
        fullName,
        password,
        avatar:avatar.url,
        coverImage:coverImg?.url || "",
    })

    //7, remove password and refreshtoken from response
    const createdUser= await User.findById(user._id).select("-password -refreshToken");
    if(!createdUser){
        throw new ApiError(500, "Something went wrong while creating user")
    }
    //response
    return res.status(201).json(
        new ApiResponse(200,"Everything went Well",createdUser)
    );
})
const loginUser=asyncHandler(async (req, res)=>{
    res.status(200).json({
        message:"User logged in successfully, welcome back"
    })
})
export {registerUser, loginUser};