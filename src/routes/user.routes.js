import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/authentication.middleware.js";
import {
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
  deleteUser
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
userRouter.route("/forget-Password").post(forgetPassword);
userRouter.route("/reset-Password").post(resetPassword);
userRouter.route("/get-current-User").get(verifyJWT, getCurrentUser);
userRouter
  .route("/update-Account-Details")
  .patch(verifyJWT, updateAccountDetails);
userRouter
  .route("/update-User-AvatarImg")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatarImg);
userRouter
  .route("/update-User-CoverImg")
  .patch(verifyJWT, upload.single("coverImage"), updateUserCoverImg);
userRouter.route("/c/:username").get(verifyJWT, getUserChannelProfile);
userRouter.route("/get-User-Watch-Histroy").get(verifyJWT, getUserWatchHistroy);
userRouter.route("/delete-User").delete(verifyJWT,deleteUser);

export default userRouter;
