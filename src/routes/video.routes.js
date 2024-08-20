import { Router } from "express";
import { verifyJWT } from "../middlewares/authentication.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { uploadVideo, getVideoById, updateVideodetails } from "../controllers/video.controller.js";

const videoRouter = Router();

videoRouter.route("/upload-video").post(
  verifyJWT,
  upload.fields([
    {
      name: "videoFile",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  uploadVideo
);
videoRouter.route("/v/:videoId").get(verifyJWT, getVideoById);
videoRouter.route("/update-video-details/:videoId").patch(verifyJWT, updateVideodetails);

export default videoRouter;
