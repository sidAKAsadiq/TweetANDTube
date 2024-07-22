import  { Router } from "express"
import { verify_jwt } from "../middlewares/auth.middleware.js"
import { get_channel_stats, get_channel_videos } from "../controllers/dashboard.controller.js"

const router = Router()

router.use(verify_jwt)
router.route('/get_channel_videos').get(get_channel_videos)
router.route('/get_channel_stats').get(get_channel_stats)


export default router