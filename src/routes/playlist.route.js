import { Router } from "express";
import { verifyJWT } from "../middlewares/authentication.middleware.js";
import { createPlaylist, addVideoToPlaylist, removeVideoFromPlaylist } from "../controllers/playlist.controller.js";

const router = Router();
router.use(verifyJWT);
router.route("/create-playlist").post(createPlaylist);
router.route("/add-video-to-playlist/:playlistId/:videoId").post(addVideoToPlaylist);
router.route("/remove-video-from-playlist/:playlistId/:videoId").patch(removeVideoFromPlaylist);

export default router;
