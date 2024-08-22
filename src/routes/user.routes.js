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
  deleteUser,
} from "../controllers/user.controller.js";

const router = Router();

router.route("/register").post(
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
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-Token").post(refreshAcessToken);
router.route("/change-Password").post(verifyJWT, changePassword);
router.route("/forget-Password").post(forgetPassword);
router.route("/reset-Password").post(resetPassword);
router.route("/get-current-User").get(verifyJWT, getCurrentUser);
router.route("/update-Account-Details").patch(verifyJWT, updateAccountDetails);
router
  .route("/update-User-AvatarImg")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatarImg);
router
  .route("/update-User-CoverImg")
  .patch(verifyJWT, upload.single("coverImage"), updateUserCoverImg);
router.route("/c/:username").get(verifyJWT, getUserChannelProfile);
router.route("/get-User-Watch-Histroy").get(verifyJWT, getUserWatchHistroy);
router.route("/delete-User").delete(verifyJWT, deleteUser);

export default router;
