import { Router } from "express";
import { verifyJWT } from "../middlewares/authentication.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { uploadVideo, getVideoById, updateVideoDetails, updateVideoThumbnail, togglePublishStatus, deleteVideo, getAllVideos } from "../controllers/video.controller.js";

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
videoRouter.route("/update-video-details/:videoId").patch(verifyJWT, updateVideoDetails);
videoRouter.route("/update-video-thumbnail/:videoId").patch(verifyJWT,upload.single('newThumbnail'), updateVideoThumbnail);
videoRouter.route("/toggle-publish-status/:videoId").patch(verifyJWT, togglePublishStatus);
videoRouter.route("/delete-video/:videoId").delete(verifyJWT, deleteVideo);
videoRouter.route("/get-All-Videos").get(verifyJWT, getAllVideos);


export default videoRouter;
