import {Router} from 'express'
import { verify_jwt } from '../middlewares/auth.middleware.js'
import { get_subscribed_channels, get_user_channel_subscribers, toggle_subscription } from '../controllers/subscription.controller.js'


const router = Router()

router.use(verify_jwt)

router.route('/toggle_subscription/:channel_id').get(toggle_subscription)
router.route('/get_user_channel_subscribers/:channel_id').get(get_user_channel_subscribers)
router.route('/get_subscribed_channels/:subscriber_id').get(get_subscribed_channels)

export default router