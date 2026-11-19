import { Router, type Request, type Response } from "express";

const router = Router();

router.get("/health", (_request: Request, response: Response) => {
  response.status(200).json({ status: "ok" });
});

export default router;