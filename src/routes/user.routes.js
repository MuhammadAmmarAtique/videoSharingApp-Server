import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/authentication.middleware.js";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAcessToken,
  changePassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatarImg,
  updateUserCoverImg,
  getUserChannelProfile,
  getUserWatchHistroy
} from "../controllers/user.controller.js";

const userRouter = Router();

userRouter.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);
userRouter.route("/login").post(loginUser);
userRouter.route("/logout").post(verifyJWT, logoutUser);
userRouter.route("/refresh-Token").post(refreshAcessToken);
userRouter.route("/change-Password").post(verifyJWT, changePassword);
userRouter.route("/get-current-User").post(verifyJWT, getCurrentUser);
userRouter.route("/update-Account-Details").post(verifyJWT, updateAccountDetails);
userRouter.route("/update-User-AvatarImg").post(
  upload.single("avatar"),
  verifyJWT,
  updateUserAvatarImg
)
userRouter.route("/update-User-CoverImg").post(
  upload.single("coverImage"),
  verifyJWT,
  updateUserCoverImg
)
userRouter.route("/get-User-Watch-Histroy").post(verifyJWT,getUserWatchHistroy);
userRouter.route("/:username").post(verifyJWT,getUserChannelProfile);

export default userRouter;
