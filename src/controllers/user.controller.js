import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jsonwebtoken from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const AccessToken = user.generateAccessToken();
    const RefreshToken = user.generateRefreshToken();
    user.refreshToken = RefreshToken;
    await user.save({ validateBeforeSave: false });
    return { AccessToken, RefreshToken };
  } catch (error) {
    throw new ApiError(
      "Some thing went wrong during access and refresh token generation!",
      500,
      error
    );
  }
};

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

  // 2) login based on username or email
  if (username.trim() === "" && email.trim() === "") {
    throw new ApiError("username or email is must required for login", 400);
  }
  // 3)checking if User already exists or not
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!existedUser) {
    throw new ApiError(
      "User not found, please try again with coreect email or username",
      404
    );
  }
  // 4) if user is found then checking password
  const checkPassord = await existedUser.isPasswordCorrect(password); //method defined in User model
  if (checkPassord === false) {
    throw new ApiError("Password is incorrect, Try again!", 400);
  }
  //5) if password is correct then generate access and refresh token + save refreshToken inside db through user object and
  // return both access and refresh token so that we can send it to user.
  const { AccessToken, RefreshToken } = await generateAccessAndRefreshToken(
    existedUser._id
  );

  //calling database again to get updated/authenticated user with refresh token  & then removing password & RT.
  const LoggedInUser = await User.findById(existedUser._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true, //by default anyone can modifies our cookies in frontend, but when we set these 2 fields true
    secure: true, //then cookies can only be modified from server.
  };

  // 6) Giving Access and Refresh Token to user securely through cookies + returning response with data
  return res
    .status(200)
    .cookie("accessToken", AccessToken, options)
    .cookie("refreshToken", RefreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: LoggedInUser,
          AccessToken,
          RefreshToken,
        },
        "User Successfully login! "
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  // way#1
  // const user = req.user;
  // user.refreshToken = undefined;
  // const updatedUser = await user.save();

  // way#2
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: { refreshToken: "" },
    },
    {
      new: true, // Get the updated document
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, null, "Logged out successfully"));
});

const refreshAcessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError("Unauthorized access", 401);
  }

  const decodedTokenInfo = jsonwebtoken.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );

  const user = await User.findById(decodedTokenInfo._id);
  if (user.refreshToken !== incomingRefreshToken) {
    throw new ApiError("Invalid RefreshToken", 401);
  }

  //generating new tokens and giving back to user
  const { AccessToken, RefreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .cookie("accessToken", AccessToken, options)
    .cookie("refreshToken", RefreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          AccessToken,
          RefreshToken,
        },
        "Access Token Refreshed Successfully!"
      )
    );
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (currentPassword.trim() === "" || newPassword.trim() === "") {
    throw new ApiError("Must enter current and new password! ", 401);
  }
  const user = req.user; //getting user through authentication middleware
  const result = await user.isPasswordCorrect(currentPassword);

  if (result === false) {
    throw new ApiError(
      "Incorrect current password! cannot change password! ",
      401
    );
  }

  user.password = newPassword; //password hashing is doing inside User model before saving
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(201, null, "Password changed Successfully!"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = req.user;
  return res.json(new ApiResponse(200, user, "Successfully got current user!"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (fullName.trim() === "" && email.trim() === "") {
    throw new ApiError(
      "Email or fullname is must required for updating account details!", 400
    );
  }

  const user = req.user;

  if (fullName) {
    user.fullName = fullName;
    await user.save();
  }
  if (email) {
    user.email = email;
    await user.save();
  }

  res.json(new ApiResponse(200, user, "Account details updated successfully!"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAcessToken,
  changePassword,
  getCurrentUser,
  updateAccountDetails,
};
