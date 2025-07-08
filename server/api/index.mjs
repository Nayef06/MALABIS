import { Router } from "express";
import authRouter from "../src/routes/auth.mjs"
import clothingRouter from "../src/routes/clothing.mjs"
import outfitsRouter from "../src/routes/outfits.mjs"
import generatorRouter from "../src/routes/generator.mjs"

const router = Router()

router.use(authRouter)
router.use(clothingRouter);
router.use(outfitsRouter);
router.use(generatorRouter);

export default router 