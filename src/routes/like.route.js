import { Router } from "express";
import {verifyJWT} from "../middlewares/authentication.middleware.js"
import {toggleVideoLike, toggleCommentLike, getAllUserLikedVideos} from"../controllers/like.controller.js"

const router = Router()
router.use(verifyJWT)

router.route("/toggle-video-like/:videoId").post(toggleVideoLike)
router.route("/toggle-comment-like/:commentId").post(toggleCommentLike)
router.route("/get-all-user-liked-videos").get(getAllUserLikedVideos)

export default router;