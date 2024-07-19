import {Router} from "express"
import { verify_jwt } from "../middlewares/auth.middleware.js"
import { publish_video , get_video_by_id, update_video_info, delete_video, toggle_publish_status , get_all_videos} from "../controllers/video.controller.js"
import { upload } from "../middlewares/multer.middleware.js"


const router = Router()
router.use(verify_jwt)

router.route('/publish_video').post(upload.fields([
 {
     name : "video_file",
     maxCount : 1
 },
 {
        name : "thumbnail" ,
        maxCount : 1
  }
]) , publish_video)


router.route('/v/:video_id').get(get_video_by_id)
router.route('/v/:video_id').post(update_video_info)
router.route('/delete_video/:video_id').delete(delete_video)
router.route('/toggle_publish_status/:video_id').get(toggle_publish_status)
router.route('/get_all_videos').get(get_all_videos)

export default router