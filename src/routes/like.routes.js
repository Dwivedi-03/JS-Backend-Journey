import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getCommentLikes,
  getLikedVideos,
  getTweetLikes,
  getVideoLikes,
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
} from "../controllers/like.controller.js";

const router = Router();
router.use(verifyJWT);

router.route("/toggle/v/:videoId").post(toggleVideoLike);
router.route("/toggle/c/:commentId").post(toggleCommentLike);
router.route("/toggle/t/:tweetId").post(toggleTweetLike);
router.route("/videos").get(getLikedVideos);
router.route("/:videoId").get(getVideoLikes);
router.route("/:commentId").get(getCommentLikes);
router.route("/:tweetId").get(getTweetLikes);

export default router;
