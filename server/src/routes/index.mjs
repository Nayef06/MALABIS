import { Router } from "express";
import authRouter from "./auth.mjs"
import clothingRouter from "./clothing.mjs"

const router = Router()

router.use(authRouter)
router.use(clothingRouter);

export default router 