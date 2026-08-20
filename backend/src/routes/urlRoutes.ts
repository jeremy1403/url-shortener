import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware";
import { shortenUrl, listUrls, getUrlStats } from "../controllers/urlController";

const router = Router();

router.post("/", requireAuth, shortenUrl);
router.get("/", requireAuth, listUrls);
router.get("/:id/stats", requireAuth, getUrlStats);

export default router;
