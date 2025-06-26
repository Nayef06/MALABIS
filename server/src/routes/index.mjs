import { Router } from "express";
import authRouter from "./auth.mjs"
import clothingRouter from "./clothing.mjs"
import outfitsRouter from "./outfits.mjs"

const router = Router()

router.use(authRouter)
router.use(clothingRouter);
router.use(outfitsRouter);

export default router 