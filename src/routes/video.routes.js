import { Router } from "express";
import { publishVideo } from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/authentication.middleware.js";

const videoRouter = Router();
videoRouter.route("/publish-video").post(verifyJWT, publishVideo);
export default videoRouter;
