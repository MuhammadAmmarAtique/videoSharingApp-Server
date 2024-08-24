import { createPlaylist } from "../controllers/playlist.controller.js";
import { Router } from "express";
import { verifyJWT } from "../middlewares/authentication.middleware.js";

const router = Router();
router.use(verifyJWT);
router.route("/create-playlist").post(createPlaylist);

export default router;
