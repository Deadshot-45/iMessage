import express from "express";
import { checkUser, protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

    router.get("/check",protectRoute,  checkUser );  

export default router;
