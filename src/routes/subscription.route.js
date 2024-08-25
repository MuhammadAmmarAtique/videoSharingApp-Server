import { Router } from "express";
import { verifyJWT } from "../middlewares/authentication.middleware.js";
import {
  toggleSubscription,
  getUserChannelSubscribers,
} from "../controllers/subscription.controller.js";

const router = Router();
router.use(verifyJWT);

router.route("/toggle-subscription/:channelId").post(toggleSubscription);
router.route("/get-user-channel-subscribers/:channelId").get(getUserChannelSubscribers);

export default router;
