import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const GenerateAccessAndRefreshToken=async (userId)=>{
    try {
        const user=await User.findOne(userId);
        const accessToken= user.generateAccessToken();
        const refreshToken=user.generateRefreshToken();
        user.refreshToken=refreshToken;
        //save this in db
        await user.save({validateBeforeSave:false});
        return {accessToken, refreshToken};
    } catch (error) {
        throw new ApiError(500,"something went wrong")
    }
}
const registerUser=asyncHandler(async (req, res)=>{
    //1,get data from frontend 
    const {fullName, email, username, password}=req.body

    //2,validation , do all filed are non empty 
    if([fullName,email,username,password].some((field)=>field?.trim()==="")){
        throw new ApiError(400, "All Field Required")
    }
    //3,checking if already exists
    const userExists= await User.findOne({
        $or:[{email}, {username}]
    })
    if(userExists){
        throw new ApiError(409, "This username or email is already register")
    }

    //4,checking for image upload,
    console.log("req.files:", req.files)
    const avatarLocalPath=req.files?.avatar[0]?.path;
    // const localCoverImage=req.files?.coverImage[0]?.path || "";
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
        coverImageLocalPath=req.files.coverImage[0].path;
    }

    if(!avatarLocalPath){throw new ApiError(400,"Avatar is Required")};

    //5,uploading to cloudinary
    const avatar= await uploadToCloudinary(avatarLocalPath);
    const coverImage=await uploadToCloudinary(coverImageLocalPath);
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
        coverImage:coverImage?.url || "",
    })

    //7, remove password and refreshtoken from response
    const createdUser= await User.findById(user._id).select("-password -refreshToken");
    if(!createdUser){
        throw new ApiError(500, "Something went wrong while creating user")
    }
    //response
    return res.status(201).json(
        new ApiResponse(200,"Everything went Well",true, createdUser)
    );
})
const loginUser=asyncHandler(async (req, res)=>{
    //get data from body/frontend
    const {email, username, password}=req.body;
    if(!email && !username){
        throw new ApiError(400, "Email or Username are required")
    }
    //check if username or email exist in db
    const user=await User.findOne({
        $or:[{username},{email}]
    })
    //if not user found-->user does not exist
    if(!user){
        throw new ApiError(404, "User does not exist")
    }
    //validate password
    const isPasswordCorrect=await user.isCorrectPassword(password)
    if(!isPasswordCorrect){
        throw new ApiError(401, "Incorrect Password")
    }
    //generate access and refresh token
    const{accessToken, refreshToken}=await GenerateAccessAndRefreshToken(user._id);
    const loggedInUser=await User.findOne(user._id).select("-password -refreshToken");
    const options={
        httpOnly:true,
        secure:true,
    }
    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            "Login Successful",
            true,
            {
                user:loggedInUser,
                accessToken,
                refreshToken,
            }
        )
    )

})

const logoutUser=asyncHandler(async (req, res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined
            }
        },
        {
            new:true
        },
    )
        const options={
        httpOnly:true,
        secure:true,
    }
    return res.
    status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(
            200,
            {},
            true,
            "User LoggedOut Successfully"
        )
    )
})

const refreshAccessToken=asyncHandler(async (req, res)=>{
    const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken
    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized, No token provided")
    }
try {
        const decodedToken=jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user= await User.findById(decodedToken?._id);
        if(!user){
            throw new ApiError(404, "User not found")
        }
        if(incomingRefreshToken!=user.refreshToken){
            throw new ApiError(401, "Unauthorized, Invalid Refresh Token or  Expired")
        }
        const {accessToken, refreshToken}=await GenerateAccessAndRefreshToken(user._id);
        const options={
            httpOnly:true,
            secure:true,
        }
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                "Access Token Refreshed Successfully",
                true,
                {accessToken, refreshToken},
            )
        )
    } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Refresh Token")}
})

const changeCurrentPassword=asyncHandler(async (req, res)=>{
    const {oldPassword, newPassword, confirmNewPassword}=req.body;
    //using the middleware we have the access of user
    const user=await User.findById(req.user?._id);
    if(!user){
        throw new ApiError(404, "User not found")
    }
    const isPasswordCorrect=await user.isCorrectPassword(oldPassword);
    if(!isPasswordCorrect){
        throw new ApiError(401, "Incorrect Old Password, NOT AUTHORIZED")
    }
    if(!(newPassword===confirmNewPassword)){
        throw new ApiError(400,"New Password and Confirm Password must be same")
    }
    user.password=newPassword;
    await user.save({validateBeforeSave:false})
    return res
    .status(200)
    .json(
        new ApiResponse(200,"Password Changed Successfully",true,{})
    )
})

const getCurrentUser=asyncHandler(async(req, res)=>{
    return res
    .status(200)
    .json(
        new ApiResponse(200,"Current User Fetched Successfully",true,req.user)
    )
})

const updateAccountDetail=asyncHandler(async(req, res)=>{
    const {fullName, email}=req.body;
    if(!fullName && !email){
        throw new ApiError(401,"Both Field are Required")
    }
    const user=User.findByIdAndUpdate(
        req.user?._id,
        {
        $set:{
            fullName:fullName,
            email:email,
        },
    }, {new:true}).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, "Account Detail Updated",true, user)
    )
})
const updateAvatar=asyncHandler(async (req, res)=>{
    const avatarLocalPath=req.file?.path;
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar Not found from req.file.path")
    }
    const avatar=await uploadToCloudinary(avatarLocalPath);
    if(!avatar.url){
        throw new ApiError(400,"Something went wrong while uploading avatar to cloudinary")
    }
    const user=findByIdAndUpdate(req.user?._id,
        {
            $set:{
                avatar:avatar.url
            }
        },{new:true}).select("-password")
    return res.status(200).json(
        new ApiResponse(200,"Avatar updated",true,user.avatar)
    )
})
const updateCoverImage=asyncHandler(async (req, res)=>{
    const coverImageLocalPath=req.file?.path;
    if(!coverImageLocalPath){
        throw new ApiError(400,"Cover Image Not found from req.file.path")
    }
    const coverImage=await uploadToCloudinary(coverImageLocalPath);
    if(!coverImage.url){
        throw new ApiError(400,"Something went wrong while uploading cover image to cloudinary")
    }
    const user=findByIdAndUpdate(req.user?._id,{
        $set:{
            coverImage:coverImage.url
        }
    }, {new:true}).select("-password")
    return res.status(200).json(
        new ApiResponse(200,"Cover Image updated",true,user.coverImage)
    )
})



export {registerUser, loginUser, logoutUser, refreshAccessToken,changeCurrentPassword, getCurrentUser,updateAccountDetail
    ,updateAvatar, updateCoverImage
};