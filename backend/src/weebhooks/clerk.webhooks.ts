import express, { Request, Response } from "express";
import { verifyWebhook } from "@clerk/express/webhooks";
    import User from "../models/user.model.js";

const router = express.Router();

const clerkWebhookHandler = async (req: Request, res: Response) => {
  try {
    const signingSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;
    if (!signingSecret) {
      console.error("Clerk signing secret is missing");
      return res.status(503).json({
        message: "Internal server error: signing secret not found",
        success: false,
        status: 503,
      });
    }

    let evt;
    try {
      evt = await verifyWebhook(req, { signingSecret });
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return res.status(401).json({
        message: "Invalid webhook signature",
        success: false,
        status: 401,
      });
    }

    const { type, data } = evt as any;

    if (type === "user.created") {
      const email = data.email_addresses?.[0]?.email_address || "";
      const emailUsername = email ? email.split("@")[0] : "";
      
      const clerkId = data.id;
      const username = data.username || emailUsername || `user_${clerkId.slice(-6)}`;
      const fullName = [data.first_name, data.last_name].filter(Boolean).join(" ") || `User ${clerkId.slice(-6)}`;
      const profilePic = data.image_url || "";

      await User.create({
        clerkId,
        username,
        fullName,
        email,
        profilePic,
      });
      console.log(`User created: ${clerkId}`);
    } else if (type === "user.updated") {
      const email = data.email_addresses?.[0]?.email_address || "";
      const emailUsername = email ? email.split("@")[0] : "";
      
      const clerkId = data.id;
      const username = data.username || emailUsername || `user_${clerkId.slice(-6)}`;
      const fullName = [data.first_name, data.last_name].filter(Boolean).join(" ") || `User ${clerkId.slice(-6)}`;
      const profilePic = data.image_url || "";

      await User.findOneAndUpdate(
        { clerkId },
        {
            clerkId,
          username,
          fullName,
          email,
          profilePic,
        },
        { new: true, upsert: true }
      );
      console.log(`User updated: ${clerkId}`);
    } else if (type === "user.deleted") {
      const clerkId = data.id;
      await User.findOneAndDelete({ clerkId });
      console.log(`User deleted: ${clerkId}`);
    }

    return res.status(200).json({ success: true, message: "Webhook processed successfully" });
  } catch (error) {
    console.error("Webhook error:", error);
    return res.status(500).json({ message: "Internal server error", success: false, status: 500 });
  }
};

router.post("/", clerkWebhookHandler);

export default router;