import { Router } from "express";
import { verifyJWT } from "../middlewares/authentication.middleware.js";
import {getUserChannelSubscribers} from '../controllers/subscription.controller.js'

const router = Router();
router.use(verifyJWT);

router.route("/get-user-channel-subscribers").get(getUserChannelSubscribers)



export default router;
