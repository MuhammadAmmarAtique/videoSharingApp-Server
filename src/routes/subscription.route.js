import { Router } from "express";
import { verifyJWT } from "../middlewares/authentication.middleware.js";
import {
  subscribeChannel,
  unsubscribeChannel,
  getUserChannelSubscribers,
} from "../controllers/subscription.controller.js";

const router = Router();
router.use(verifyJWT);

router.route("/subscribe-channel/:channelId").post(subscribeChannel);
router.route("/unsubscribe-channel/:channelId").delete(unsubscribeChannel);
router.route("/get-user-channel-subscribers").get(getUserChannelSubscribers);

export default router;
