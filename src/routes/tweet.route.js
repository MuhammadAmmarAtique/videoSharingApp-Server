import { Router } from "express";
import { verifyJWT } from "../middlewares/authentication.middleware.js";
import { createTweet, updateTweet, deleteTweet ,getUserTweets  } from "../controllers/tweet.controller.js";

const router = Router();
router.use(verifyJWT);

router.route("/create-tweet").post(createTweet)
router.route("/update-tweet/:tweetId").patch(updateTweet)
router.route("/delete-tweet/:tweetId").delete(deleteTweet)
router.route("/get-User-tweet").get(getUserTweets)



export default router;
