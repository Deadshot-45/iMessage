import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getMessages,
  getConversations,
  sendMessage,
} from "../controllers/message.controller.js";
import upload from "../middleware/upload.middleware.js";
const router = express.Router();

router.use(protectRoute);

router.get("/conversations", getConversations);
router.get("/:id", getMessages);
router.post("/send/:id", upload.single("chatMedia"), sendMessage);

export default router;
