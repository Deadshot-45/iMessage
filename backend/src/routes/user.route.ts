import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getUsers } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/users", protectRoute, getUsers);  
export default router;
