import { Router } from "express";
import { verifyJWT } from "../middlewares/authentication.middleware.js";
import {
  toggleSubscription,
  getChannelSubscribers,
  getUserSubscribedChannels
} from "../controllers/subscription.controller.js";

const router = Router();
router.use(verifyJWT);

router.route("/toggle-subscription/:channelId").post(toggleSubscription);
router.route("/get-channel-subscribers/:channelId").get(getChannelSubscribers);
router.route("/get-user-subscribed-channel").get(getUserSubscribedChannels);

export default router;
