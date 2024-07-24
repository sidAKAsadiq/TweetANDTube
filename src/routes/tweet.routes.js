import { Router } from "express";
import { create_tweet, delete_tweet, get_tweets_based_on_interest, get_tweets_homepage, get_user_tweets, tweet_grammatical_check, update_tweet } from "../controllers/tweet.controller.js";
import { verify_jwt } from "../middlewares/auth.middleware.js";


const router = Router()

router.use(verify_jwt)

router.route('/create_tweet').post(create_tweet)
router.route('/get_user_tweets').get(get_user_tweets)
router.route('/update_tweet/:tweet_id').post(update_tweet)
router.route('/delete_tweet/:tweet_id').delete(delete_tweet)
router.route('/tweet_grammatical_check/:tweet_id').get(tweet_grammatical_check)
router.route('/tweet_grammatical_check/:tweet_id').get(tweet_grammatical_check)
router.route('/get_tweets_homepage').get(get_tweets_homepage)
router.route('/get_tweets_based_on_interest').get(get_tweets_based_on_interest)





export default router