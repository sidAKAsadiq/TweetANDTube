import { Router } from "express";
import { verify_jwt } from "../middlewares/auth.middleware.js";
import { add_video_to_playlist, create_playlist, delete_playlist, get_playlist_by_id, get_user_playlists, remove_video_from_playlist, update_playlist } from "../controllers/playlist.controller.js";

const router = Router()

router.use(verify_jwt)

router.route('/create_playlist').post(create_playlist)
router.route('/get_user_playlists/:user_id').get(get_user_playlists)
router.route('/get_playlist_by_id/:playlist_id').get(get_playlist_by_id)
router.route('/add_video_to_playlist/:playlist_id/:video_id').get(add_video_to_playlist)
router.route('/remove_video_from_playlist/:playlist_id/:video_id').get(remove_video_from_playlist)
router.route('/delete_playlist/:playlist_id').get(delete_playlist)
router.route('/delete_playlist/:playlist_id').get(delete_playlist)
router.route('/update_playlist/:playlist_id').post(update_playlist)








export default router