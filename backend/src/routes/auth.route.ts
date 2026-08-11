import express from "express";
import { checkUser, protectRoute } from "../controllers/auth.controller.js";

const router = express.Router();

    router.get("/check",protectRoute,  checkUser );  

export default router;
