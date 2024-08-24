import { Router } from "express";
import { verifyJWT } from "../middlewares/authentication.middleware.js";
import {
  createPlaylist,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  getPlaylistById,
  getUserPlaylists,
  updatePlaylist,
  deletePlaylist,
} from "../controllers/playlist.controller.js";

const router = Router();
router.use(verifyJWT);

router.route("/create-playlist").post(createPlaylist);
router
  .route("/add-video-to-playlist/:playlistId/:videoId")
  .post(addVideoToPlaylist);
router
  .route("/remove-video-from-playlist/:playlistId/:videoId")
  .patch(removeVideoFromPlaylist);
router.route("/get-playlist-by-Id/:playlistId").get(getPlaylistById);
router.route("/get-user-playlist").get(getUserPlaylists);
router.route("/update-playlist/:playlistId").patch(updatePlaylist);
router.route("/delete-playlist/:playlistId").delete(deletePlaylist);

export default router;
