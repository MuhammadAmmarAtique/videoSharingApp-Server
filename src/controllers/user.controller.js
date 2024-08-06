import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"

const registerUser = asyncHandler(async (req, res) => { 
  // get user details from frontend
  // validation - not empty
  // check if user already exists: username, email
  // check for images, check for avatar
  // upload them to cloudinary, avatar
  // create user object - create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return res

  //1- getting user details
  const { username, email, fullName, password } = req.body;
  console.log("username::", username);

  //2- validating that if any of user entered data is empty
  if (
    [username, email, fullName, password].some((field) => field.trim() === "")
  ) {
    throw new ApiError("Must enter all input fileds", 400);
  }

  // 3- checking if user with same username or email already exists
  const existedUser = User.find({
    $or: [{ username }, { email }],
  });
  

  if (existedUser) {
    throw new ApiError("User with same email or password already exists ", 400);
  }

  // 4- checking if user gave us images specially avatar
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError("Avatar image is must required for registration", 406)
  }

  // 5- Uploading images in cloudinary
  const uploadedAvatar= await uploadOnCloudinary(avatarLocalPath)
  const uploadedCoverImg = await uploadOnCloudinary(coverImageLocalPath)

  if (!uploadedAvatar) {
    throw new ApiError ("Avatar image not uploaded", 406)
  }


  res.send("all ok");
  res.end();
});

export default registerUser;
