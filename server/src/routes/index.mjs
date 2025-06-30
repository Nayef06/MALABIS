import { Router } from "express";
import authRouter from "./auth.mjs"
import clothingRouter from "./clothing.mjs"
import outfitsRouter from "./outfits.mjs"
import generatorRouter from "./generator.mjs"

const router = Router()

router.use(authRouter)
router.use(clothingRouter);
router.use(outfitsRouter);
router.use(generatorRouter);

export default router 