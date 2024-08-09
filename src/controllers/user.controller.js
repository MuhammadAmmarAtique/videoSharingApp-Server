import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  //1- getting user details
  const { username, email, fullName, password } = req.body;

  //2- validating that if any of user entered data is empty
  if (
    [username, email, fullName, password].some((field) => field.trim() === "")
  ) {
    throw new ApiError("Must enter all required input fields! ", 400);
  }

  // 3- checking if user with same username or email already exists
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(
      "User with same email or password already exists! ",
      400
    );
  }

  // 4- checking if user gave us images specially avatar
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError("Avatar image is must required for Registration!", 406);
  }

  // 5- Uploading images in cloudinary
  const uploadedAvatar = await uploadOnCloudinary(avatarLocalPath);
  const uploadedCoverImg = await uploadOnCloudinary(coverImageLocalPath);

  if (!uploadedAvatar) {
    throw new ApiError("Problem during Avatar image Upload!", 406);
  }

  // 6- create user object and doing entry in db
  const user = await User.create({
    username: username.toLowerCase(),
    email,
    fullName,
    password,
    avatar: uploadedAvatar.url,
    coverImage: uploadedCoverImg?.url || "",
  });

  // 7+8- checking if User is created in db and removing password and refresh token from it
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError("Server Error during user Registration! ", 500);
  }

  //9- returning response
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User Created Successfully! "));
});

const loginUser = asyncHandler(async (req, res) => {
  //1) geting data from user for authentication
  const { username, email, password } = req.body;
  if (username.trim() === "" && email.trim() === "") {
    throw new ApiError("username or email is must required for login", 400);
  }

  return res.status(201).send("Okay hogya");
});

export { registerUser, loginUser };
