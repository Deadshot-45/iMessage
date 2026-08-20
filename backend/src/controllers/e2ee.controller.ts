import { Request, Response } from "express";
import E2EEKey, { IOneTimePreKey } from "../models/e2eeKey.model.js";
import Friendship from "../models/friendship.model.js";

/**
 * Register or update the user's public E2EE key bundle (Identity Key, Signed PreKey, and initial pool of One-Time PreKeys).
 */
export const registerKeys = async (req: Request, res: Response) => {
  try {
    const loggedInUserId = req.user?._id;
    const { identityKey, signedPreKey, oneTimePreKeys } = req.body;

    if (!loggedInUserId) {
      return res.status(401).json({
        success: false,
        status: 401,
        message: "Unauthorized",
      });
    }

    if (!identityKey || !signedPreKey || !signedPreKey.publicKey || !signedPreKey.signature) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: "Identity key, signed prekey, and signature are required",
      });
    }

    const formattedOPKs: IOneTimePreKey[] = Array.isArray(oneTimePreKeys)
      ? oneTimePreKeys.map((opk: { keyId: number; publicKey: string }) => ({
          keyId: opk.keyId,
          publicKey: opk.publicKey,
          consumed: false,
        }))
      : [];

    const updatedKeyDoc = await E2EEKey.findOneAndUpdate(
      { userId: loggedInUserId },
      {
        userId: loggedInUserId,
        identityKey,
        signedPreKey: {
          keyId: signedPreKey.keyId || 1,
          publicKey: signedPreKey.publicKey,
          signature: signedPreKey.signature,
          createdAt: new Date(),
        },
        $addToSet: {
          oneTimePreKeys: { $each: formattedOPKs },
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      success: true,
      status: 200,
      message: "E2EE keys registered successfully",
      data: {
        userId: updatedKeyDoc.userId,
        identityKey: updatedKeyDoc.identityKey,
        signedPreKeyId: updatedKeyDoc.signedPreKey.keyId,
        availableOneTimePreKeysCount: updatedKeyDoc.oneTimePreKeys.filter((k) => !k.consumed).length,
      },
    });
  } catch (error: any) {
    console.error("Error registering E2EE keys:", error);
    return res.status(500).json({
      success: false,
      status: 500,
      message: error.message || "Failed to register E2EE keys",
    });
  }
};

/**
 * Fetch a target user's public prekey bundle to initiate an X3DH session.
 * Atomically claims and consumes one One-Time PreKey (OPK) if available.
 */
export const getPrekeyBundle = async (req: Request, res: Response) => {
  try {
    const loggedInUserId = req.user?._id;
    const targetUserId = req.params.userId;

    if (!loggedInUserId || !targetUserId) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: "User ID is required",
      });
    }

    // Verify friendship before allowing key bundle discovery
    const isFriend = await Friendship.exists({
      $or: [
        { requester: loggedInUserId, recipient: targetUserId, status: "accepted" },
        { requester: targetUserId, recipient: loggedInUserId, status: "accepted" },
      ],
    });

    if (!isFriend && targetUserId.toString() !== loggedInUserId.toString()) {
      return res.status(403).json({
        success: false,
        status: 403,
        message: "You can only request cryptographic prekeys for friends.",
      });
    }

    // Find the key document
    const keyDoc = await E2EEKey.findOne({ userId: targetUserId });
    if (!keyDoc) {
      return res.status(404).json({
        success: false,
        status: 404,
        message: "Target user has not registered E2EE keys",
      });
    }

    // Atomically find and consume one unconsumed OPK
    let claimedOPK: { keyId: number; publicKey: string } | null = null;
    const unconsumedOPKIndex = keyDoc.oneTimePreKeys.findIndex((k) => !k.consumed);

    if (unconsumedOPKIndex !== -1) {
      const opk = keyDoc.oneTimePreKeys[unconsumedOPKIndex];
      claimedOPK = {
        keyId: opk.keyId,
        publicKey: opk.publicKey,
      };

      // Mark as consumed in DB
      keyDoc.oneTimePreKeys[unconsumedOPKIndex].consumed = true;
      keyDoc.oneTimePreKeys[unconsumedOPKIndex].consumedAt = new Date();
      await keyDoc.save();
    }

    return res.status(200).json({
      success: true,
      status: 200,
      data: {
        userId: keyDoc.userId,
        identityKey: keyDoc.identityKey,
        signedPreKey: {
          keyId: keyDoc.signedPreKey.keyId,
          publicKey: keyDoc.signedPreKey.publicKey,
          signature: keyDoc.signedPreKey.signature,
        },
        oneTimePreKey: claimedOPK, // Null if OPK pool is depleted (fallback to 3DH)
      },
    });
  } catch (error: any) {
    console.error("Error fetching prekey bundle:", error);
    return res.status(500).json({
      success: false,
      status: 500,
      message: error.message || "Failed to fetch prekey bundle",
    });
  }
};

/**
 * Returns current OPK pool status for the authenticated user so client knows if replenishment is needed.
 */
export const getPrekeyStatus = async (req: Request, res: Response) => {
  try {
    const loggedInUserId = req.user?._id;

    if (!loggedInUserId) {
      return res.status(401).json({
        success: false,
        status: 401,
        message: "Unauthorized",
      });
    }

    const keyDoc = await E2EEKey.findOne({ userId: loggedInUserId });
    if (!keyDoc) {
      return res.status(200).json({
        success: true,
        status: 200,
        data: {
          isRegistered: false,
          availableOneTimePreKeysCount: 0,
          requiresReplenishment: true,
        },
      });
    }

    const availableCount = keyDoc.oneTimePreKeys.filter((k) => !k.consumed).length;

    return res.status(200).json({
      success: true,
      status: 200,
      data: {
        isRegistered: true,
        availableOneTimePreKeysCount: availableCount,
        requiresReplenishment: availableCount < 20,
      },
    });
  } catch (error: any) {
    console.error("Error checking prekey status:", error);
    return res.status(500).json({
      success: false,
      status: 500,
      message: error.message || "Failed to fetch prekey status",
    });
  }
};

/**
 * Replenish the user's pool of One-Time PreKeys.
 */
export const replenishOneTimePrekeys = async (req: Request, res: Response) => {
  try {
    const loggedInUserId = req.user?._id;
    const { oneTimePreKeys } = req.body;

    if (!loggedInUserId) {
      return res.status(401).json({
        success: false,
        status: 401,
        message: "Unauthorized",
      });
    }

    if (!Array.isArray(oneTimePreKeys) || oneTimePreKeys.length === 0) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: "Array of oneTimePreKeys is required",
      });
    }

    const formattedOPKs: IOneTimePreKey[] = oneTimePreKeys.map((opk: { keyId: number; publicKey: string }) => ({
      keyId: opk.keyId,
      publicKey: opk.publicKey,
      consumed: false,
    }));

    const keyDoc = await E2EEKey.findOneAndUpdate(
      { userId: loggedInUserId },
      {
        $push: {
          oneTimePreKeys: { $each: formattedOPKs },
        },
      },
      { new: true }
    );

    if (!keyDoc) {
      return res.status(404).json({
        success: false,
        status: 404,
        message: "User has not initialized E2EE identity keys yet",
      });
    }

    const availableCount = keyDoc.oneTimePreKeys.filter((k) => !k.consumed).length;

    return res.status(200).json({
      success: true,
      status: 200,
      message: `Successfully replenished ${formattedOPKs.length} one-time prekeys`,
      data: {
        availableOneTimePreKeysCount: availableCount,
      },
    });
  } catch (error: any) {
    console.error("Error replenishing one-time prekeys:", error);
    return res.status(500).json({
      success: false,
      status: 500,
      message: error.message || "Failed to replenish prekeys",
    });
  }
};
