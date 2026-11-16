import { Router } from "express";
import { asyncHandler } from "../lib/async-handler";
import * as userController from "../controllers/user.controller";

const router = Router();

router.get("/:id", asyncHandler(userController.getUser));

export default router;
