import { verifyJWT } from "../middlewares/authentication.middleware.js";
import { getChannelVideos,getChannelStats } from "../controllers/dashboard.controller.js";

import { Router } from "express";
const router = Router();
router.use(verifyJWT);

router.route("/get-channel-videos").get(getChannelVideos);
router.route("/get-channel-stats").get(getChannelStats);

export default router;
