import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getFriends,
  getFriendRequests,
  removeFriend,
  requestFriend,
  respondToFriendRequest,
} from "../controllers/friend.controller.js";

const router = express.Router();

router.use(protectRoute);

router.get("/", getFriends);
router.get("/requests", getFriendRequests);
router.post("/request/:targetUserId", requestFriend);
router.patch("/respond/:requestId", respondToFriendRequest);
router.delete("/:userIdToRemove", removeFriend);

export default router;

