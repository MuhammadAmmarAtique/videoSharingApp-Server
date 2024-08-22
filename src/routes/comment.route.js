import { Router } from "express";
import { verifyJWT } from "../middlewares/authentication.middleware.js";
import {
  addComment,
  updateComment,
  deleteComment,
} from "../controllers/comment.controller.js";

const router = Router();
router.use(verifyJWT);

router.route("/add-Comment/:videoId").post(addComment);
router.route("/update-Comment/:commentId").patch(updateComment);
router.route("/delete-Comment/:commentId").delete(deleteComment);

export default router;
