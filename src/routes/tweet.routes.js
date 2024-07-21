import { Router } from "express";
import { create_tweet, delete_tweet, get_user_tweets, update_tweet } from "../controllers/tweet.controller.js";
import { verify_jwt } from "../middlewares/auth.middleware.js";


const router = Router()

router.use(verify_jwt)

router.route('/create_tweet').post(create_tweet)
router.route('/get_user_tweets').get(get_user_tweets)
router.route('/update_tweet/:tweet_id').post(update_tweet)
router.route('/delete_tweet/:tweet_id').delete(delete_tweet)



export default router