import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { asyncHandler } from "../lib/async-handler";
import { authMiddleware } from "../middlewares/auth.middleware";
import { loginRateLimiter, registerRateLimiter } from "../middlewares/rate-limit.middleware";

const router = Router();

router.post("/register", registerRateLimiter, asyncHandler(authController.register));
router.post("/login", loginRateLimiter, asyncHandler(authController.login));
router.get("/me", authMiddleware, asyncHandler(authController.me));
router.post("/logout", asyncHandler(authController.logout));

export default router;
