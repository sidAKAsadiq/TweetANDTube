import { Router } from "express";
import { verify_jwt } from "../middlewares/auth.middleware.js";
import { get_video_comments, get_tweet_comments, add_comment_video, add_comment_tweet, edit_comment, delete_comment } from "../controllers/comment.controller.js";

const router = Router()

router.use(verify_jwt)

router.route('/get_video_comments/:video_id').get(get_video_comments)
router.route('/get_tweet_comments/:tweet_id').get(get_tweet_comments)
router.route('/add_comment_video/:video_id').post(add_comment_video)
router.route('/add_comment_tweet/:tweet_id').post(add_comment_tweet)
router.route('/edit_comment/:comment_id').post(edit_comment)
router.route('/delete_comment/:comment_id').delete(delete_comment)


export default router