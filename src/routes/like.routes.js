import { Router } from "express";
import { verify_jwt } from "../middlewares/auth.middleware.js";
import {get_liked_tweets ,get_liked_comments ,get_liked_videos, toggle_comment_like, toggle_tweet_like, toggle_video_like } from "../controllers/like.controllers.js";

const router = Router()
router.use(verify_jwt)

router.route('/toggle_video_like/:video_id').get(toggle_video_like)
router.route('/toggle_comment_like/:comment_id').get(toggle_comment_like)
router.route('/toggle_tweet_like/:tweet_id').get(toggle_tweet_like)
router.route('/get_liked_videos').get(get_liked_videos)
router.route('/get_liked_comments').get(get_liked_comments)
router.route('/get_liked_tweets').get(get_liked_tweets)

export default router