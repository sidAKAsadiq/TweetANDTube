import { Router } from "express";
import { health_check } from "../controllers/health_check.controller.js";


const router = Router()

router.route('/health_check').get(health_check)


export default router