import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { deleteFromCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jsonwebtoken from "jsonwebtoken";
import { mongoose } from "mongoose";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";

// generateAccessAndRefreshToken method will be used for login & refreshing access token.
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

//cookies options to be used in login,logout,refreshAcessToken & deleteUser.
const options = {
  httpOnly: true, //by default anyone can modifies our cookies in frontend, but when we set these 2 fields true
  secure: true, //then cookies can only be modified from server.
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
    coverImage: uploadedCoverImg?.url,
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
      "User not found, please try again with correct email or username",
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
      $unset: { refreshToken: 1 }, // 1 flag will remove the field from our document
    },
    {
      new: true, // Get the updated document
    }
  );

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

const forgetPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  //1) Check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError("User not found! ", 404);
  }

  // 2) Generating a reset token
  const resetToken = jsonwebtoken.sign(
    { _id: user._id },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_RESET_EXPIRATION,
    }
  );

  // 3) Sending reset token via from our email to user email
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: "noreply@example.com",
    to: user.email,
    subject: "Password Reset",
    text: `You requested a password reset. Please use the following token to reset your password: ${resetToken}`,
  };

  await transporter.sendMail(mailOptions);
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "Password reset token successfully sent to your gmail Account!"
      )
    );
});

const resetPassword = asyncHandler(async (req, res) => {
  const { newPassword, token } = req.body;
  if (!newPassword?.trim() || !token?.trim()) {
    throw new ApiError(
      "Must enter both your newpassword and token you get from your email to reset your Account's Password!",
      400
    );
  }

  // 1) Verifying the reset token we sent to user via email and comparing it with the one we sent using our JWT_SECRET
  let decodedTokenInfo = jsonwebtoken.verify(token, process.env.JWT_SECRET);
  if (!decodedTokenInfo) {
    throw new ApiError(
      "Invalid token, Enter again! Add no extra spaces while entering!",
      400
    );
  }
  //2) Hash the new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  // 3) Finding and Updating User
  const updatedUser = await User.findByIdAndUpdate(
    decodedTokenInfo._id,
    {
      password: hashedPassword,
    },
    { new: true }
  );
  if (!updatedUser) {
    throw new ApiError("Problem while updating user password!", 500);
  }
  console.log("updatedUser: ", updatedUser);

  res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Password reset successful"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = req.user;
  return res.json(new ApiResponse(200, user, "Successfully got current user!"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (fullName.trim() === "" && email.trim() === "") {
    throw new ApiError(
      "Email or fullname is must required for updating account details!",
      400
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

const updateUserAvatarImg = asyncHandler(async (req, res) => {
  // 1) Ensure the user is logged in
  const user = req.user;

  if (!user) {
    throw new ApiError(
      "Authentication failed! Login is must required for Avatar image update!",
      401
    );
  }
  //old image to be deleted after successful new img successful upload
  const oldAvatar = user.avatar;
  // 2) Get the new image through the multer middleware
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError("Must provide image!", 400);
  }
  // 3) Upload the new image to Cloudinary
  const uploadedAvatar = await uploadOnCloudinary(avatarLocalPath);

  if (!uploadedAvatar.url) {
    throw new ApiError("Problem during Avatar image Upload!", 406);
  }

  // 4) Update user's avatar URL  then save
  user.avatar = uploadedAvatar.url;
  await user.save();

  // 5) Delete the old image from Cloudinary after user is updated
  function extractPublicIdFromUrl(url) {
    // Extract the substring after the last '/'
    const publicIdWithExtension = url.substring(url.lastIndexOf("/") + 1);

    // Remove the file extension (e.g., .jpg)
    const publicId = publicIdWithExtension.split(".")[0];

    return publicId;
  }

  const OldavatarPublicId = extractPublicIdFromUrl(oldAvatar);

  if (OldavatarPublicId) {
    await deleteFromCloudinary(OldavatarPublicId);
  }

  res
    .status(200)
    .json(new ApiResponse(200, {}, "Successfully updated avatar Image"));
});

const updateUserCoverImg = asyncHandler(async (req, res) => {
  // 1) Ensure the user is logged in
  const user = req.user;

  if (!user) {
    throw new ApiError(
      "Authentication failed! Login is must required for Cover image update!",
      401
    );
  }
  //old image to be deleted after successful new img successful upload
  const oldCover = user.coverImage;

  // 2) Get the new image through the multer middleware
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError("Must provide image!", 400);
  }
  // 3) Upload the new image to Cloudinary
  const uploadedCoverImg = await uploadOnCloudinary(coverImageLocalPath);

  if (!uploadedCoverImg.url) {
    throw new ApiError("Problem during Cover image Upload!", 406);
  }

  if (user.coverImagePublicId) {
    await deleteFromCloudinary(user.coverImagePublicId);
  }
  // 4) Update user's cover URL  then save
  user.coverImage = uploadedCoverImg.url;
  await user.save();

  // 5) Delete the old image from Cloudinary after user is updated
  function extractPublicIdFromUrl(url) {
    // Extract the substring after the last '/'
    const publicIdWithExtension = url.substring(url.lastIndexOf("/") + 1);

    // Remove the file extension (e.g., .jpg)
    const publicId = publicIdWithExtension.split(".")[0];

    return publicId;
  }

  if (oldCover) {
    const OldcoverPublicId = extractPublicIdFromUrl(oldCover);
    await deleteFromCloudinary(OldcoverPublicId);
  }

  res
    .status(200)
    .json(new ApiResponse(200, {}, "Successfully updated Cover Image"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username?.trim()) {
    throw new ApiError("Error in getting Username from url", 400);
  }

  //way#1 of finding User
  // const user = await User.findOne({username})
  // console.log("user: ", user);

  const getUserChannelProfile = await User.aggregate([
    //stage 1 (way#2 of finding User/ we know that User is "Channel" also)
    {
      $match: {
        //match operator will find that user object whose username matched with one we are getting from url
        username: username?.toLowerCase(),
      },
    },
    // stage 2  (Finding our channel/User "subscribers")
    {
      $lookup: {
        //Here lookup operator join our user object with subscription object
        from: "subscriptions",
        localField: "_id", // lets suppose our channel is "chai-aur-code", it has unique id.
        foreignField: "channel", //above id will be matched to channel field id & we will get our channel subscribers
        as: "subscribers",
      },
    },
    // stage 3 (Finding to whom our channel/User "subscribed")
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    // stage 4 (Adding field in our Channel/User b/c in stage 2 & stage 4 we got only objects)
    {
      $addFields: {
        subcribersCount: {
          $size: "$subscribers", //size operator will count all the objects inside subscribers Array
        },
        channelSubscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    // stage 5 (using $project operator to send necessary files in frontend, so it can be displayed in UI)
    {
      $project: {
        username: 1,
        email: 1,
        fullName: 1,
        avatar: 1,
        coverImage: 1,
        subcribersCount: 1,
        channelSubscribedToCount: 1,
        isSubscribed: 1,
      },
    },
  ]);

  //**IMP**// comment every pipeline and see output of every pipeline what it does!
  // console.log("getUserChannelProfile:", getUserChannelProfile);

  if (!getUserChannelProfile?.length) {
    throw new ApiError("Channel doesnot exists", 400);
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        getUserChannelProfile[0],
        "Channel fetched successfully!"
      )
    );
});

const getUserWatchHistroy = asyncHandler(async (req, res) => {
  const UserWatchHistroy = await User.aggregate([
    // stage 1 (getting User)
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
        // _id:  req.user._id
      },
    },
    // stage 2 (getting all videos User has watched) (its Pipeline with subPipelines)
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        // subpipeline (to add owner field inside videos)
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              // sub-sub pipeline (to send only necessary data of user inside owner field)
              pipeline: [
                {
                  $project: {
                    username: 1,
                    fullName: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          //when above work is done sending object back, instead of Array of object.
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);
  console.log(UserWatchHistroy);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        UserWatchHistroy[0],
        "User watched histroy fetched Successfully!"
      )
    );
});

const deleteUser = asyncHandler(async (req, res) => {
  //Images to be deleted from cloudinary, after successful account deletion!
  const user = req.user;
  const avatarImg = user.avatar;
  const coverImg = user.coverImage;

  //deleting account
  await User.findByIdAndDelete(req.user._id);

  //deleting images after account deletion
  function extractPublicIdFromUrl(url) {
    // Extract the substring after the last '/'
    const publicIdWithExtension = url.substring(url.lastIndexOf("/") + 1);

    // Remove the file extension (e.g., .jpg)
    const publicId = publicIdWithExtension.split(".")[0];

    return publicId;
  }

  if (avatarImg) {
    const avatarPublicId = extractPublicIdFromUrl(avatarImg);
    await deleteFromCloudinary(avatarPublicId);
  }

  if (coverImg) {
    const coverPublicId = extractPublicIdFromUrl(coverImg);
    await deleteFromCloudinary(coverPublicId);
  }

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, null, "User Account deleted successfully!"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAcessToken,
  changePassword,
  forgetPassword,
  resetPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatarImg,
  updateUserCoverImg,
  getUserChannelProfile,
  getUserWatchHistroy,
  deleteUser,
};
