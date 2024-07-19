import { Router } from "express";
import { register_user , login_user, logout_user, refresh_access_token, change_password, get_current_user,update_info, update_avatar, update_cover_image , get_channel_profile, watch_history} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verify_jwt } from "../middlewares/auth.middleware.js";


const router = Router()

router.route('/register').post(
    upload.fields([
{
    name : "avatar",
    maxCount: 1,
},
{
    name : "cover_image",
    maxCount: 1,
}
]),
register_user)

router.route('/login').post(login_user)
//.post mostly when sending data  , .get jab user kuch bhej na raha ho
//Secured routes
router.route('/logout').post(verify_jwt ,logout_user)
router.route('/refresh_access_token').post(verify_jwt ,refresh_access_token)
router.route('/change_password').patch(verify_jwt , change_password) //i think .patch use hona chahiye
router.route('/get_current_user').get(verify_jwt , get_current_user)
router.route('/update_info').patch(verify_jwt , update_info) //not .post as it would update everything
router.route('/update_avatar').patch(verify_jwt,upload.single("avatar") , update_avatar)
router.route('/update_cover_image').patch(verify_jwt, upload.single("cover_image"), update_cover_image)

//a route where we are taking variable from URL 
router.route('/c/:username_of_channel').get(verify_jwt , get_channel_profile)

router.route('/watch_history').get(verify_jwt , watch_history)


export default router