import express from "express";
import {
  registerKeys,
  getPrekeyBundle,
  getPrekeyStatus,
  replenishOneTimePrekeys,
} from "../controllers/e2ee.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// All E2EE routes require authentication
router.post("/keys/register", protectRoute, registerKeys);
router.get("/keys/status", protectRoute, getPrekeyStatus);
router.post("/keys/replenish", protectRoute, replenishOneTimePrekeys);
router.get("/prekeys/:userId", protectRoute, getPrekeyBundle);

export default router;
