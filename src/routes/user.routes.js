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
  updateAccountDetails
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

export default userRouter;
