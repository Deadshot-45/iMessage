import express from "express";
import { signup, signin, logout } from "../controllers/auth.controller.js";
import { checkUser, protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/login", signin); // alias for convenience
router.post("/logout", protectRoute, logout);
router.get("/check", protectRoute, checkUser);

export default router;
