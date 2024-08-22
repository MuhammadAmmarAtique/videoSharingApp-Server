import { Router } from "express";
import { verifyJWT } from "../middlewares/authentication.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  uploadVideo,
  getVideoById,
  updateVideoDetails,
  updateVideoThumbnail,
  togglePublishStatus,
  deleteVideo,
  getAllVideos,
} from "../controllers/video.controller.js";

const router = Router();
// Apply verifyJWT middleware to all routes in this file i.e User must be logged in to upload,get,update,delete... video!
router.use(verifyJWT);

router.route("/upload-video").post(
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
router.route("/v/:videoId").get(getVideoById);
router.route("/update-video-details/:videoId").patch(updateVideoDetails);
router
  .route("/update-video-thumbnail/:videoId")
  .patch(upload.single("newThumbnail"), updateVideoThumbnail);
router.route("/toggle-publish-status/:videoId").patch(togglePublishStatus);
router.route("/delete-video/:videoId").delete(deleteVideo);
router.route("/get-All-Videos").get(getAllVideos);

export default router;
