import { Router } from "express";
import { verifyJWT } from "../middlewares/authentication.middleware.js";
import { addComment } from "../controllers/comment.controller.js";

const router = Router();
router.use(verifyJWT);

router.route("/add-Comment/:videoId").post(addComment);

export default router;
