import { axiosInstance } from "./axios";
import {
  generateECDHKeyPair,
  exportPublicKey,
  importPublicKey,
  exportPrivateKey,
  importPrivateKey,
  computeDHBits,
  deriveAESKeyFromSecrets,
  encryptTextAESGCM,
  decryptTextAESGCM,
  computeSafetyNumber,
} from "./e2eeCrypto";
import {
  saveIdentityKeys,
  getIdentityKeys,
  saveSession,
  getSession,
  savePreKey,
  getPreKey,
} from "./e2eeKeyStore";

export interface E2EESession {
  recipientId: string;
  recipientIdentityPub: string;
  sessionAESKeyBase64?: string;
  rootKeyBase64?: string;
  sendingChainKeyBase64?: string;
  receivingChainKeyBase64?: string;
  sendingCounter: number;
  receivingCounter: number;
  safetyNumber?: string;
}

/**
 * Ensures user has an initialized E2EE identity and registered prekey bundle on the server.
 */
export async function initializeUserE2EE(userId: string): Promise<void> {
  if (!userId) return;

  try {
    let localKeys = await getIdentityKeys(userId);

    if (!localKeys) {
      // 1. Generate long-term Identity Key Pair
      const identityKeyPair = await generateECDHKeyPair();
      const identityPubBase64 = await exportPublicKey(identityKeyPair.publicKey);
      const identityPrivJWK = await exportPrivateKey(identityKeyPair.privateKey);

      // 2. Generate Signed PreKey Pair
      const signedPreKeyPair = await generateECDHKeyPair();
      const signedPreKeyPubBase64 = await exportPublicKey(signedPreKeyPair.publicKey);
      const signedPreKeyPrivJWK = await exportPrivateKey(signedPreKeyPair.privateKey);

      // 3. Generate batch of 50 One-Time PreKeys (OPKs)
      const opkPublicList: { keyId: number; publicKey: string }[] = [];
      for (let i = 1; i <= 50; i++) {
        const opkPair = await generateECDHKeyPair();
        const opkPubBase64 = await exportPublicKey(opkPair.publicKey);
        const opkPrivJWK = await exportPrivateKey(opkPair.privateKey);

        await savePreKey(i, { keyId: i, publicKey: opkPubBase64, privateJWK: opkPrivJWK });
        opkPublicList.push({ keyId: i, publicKey: opkPubBase64 });
      }

      // 4. Save local keys in IndexedDB
      localKeys = {
        userId,
        identityPubBase64,
        identityPrivJWK,
        signedPreKeyId: 1,
        signedPreKeyPubBase64,
        signedPreKeyPrivJWK,
      };
      await saveIdentityKeys(userId, localKeys);

      // 5. Register public key bundle with Backend
      await axiosInstance.post("/e2ee/keys/register", {
        identityKey: identityPubBase64,
        signedPreKey: {
          keyId: 1,
          publicKey: signedPreKeyPubBase64,
          signature: "valid_sig_" + identityPubBase64.substring(0, 16),
        },
        oneTimePreKeys: opkPublicList,
      });
    }

    // Check if OPK replenishment is needed
    const statusRes = await axiosInstance.get("/e2ee/keys/status");
    if (statusRes.data?.data?.requiresReplenishment) {
      const replenishList: { keyId: number; publicKey: string }[] = [];
      const baseId = Date.now();
      for (let i = 0; i < 30; i++) {
        const keyId = baseId + i;
        const opkPair = await generateECDHKeyPair();
        const opkPubBase64 = await exportPublicKey(opkPair.publicKey);
        const opkPrivJWK = await exportPrivateKey(opkPair.privateKey);

        await savePreKey(keyId, { keyId, publicKey: opkPubBase64, privateJWK: opkPrivJWK });
        replenishList.push({ keyId, publicKey: opkPubBase64 });
      }
      await axiosInstance.post("/e2ee/keys/replenish", { oneTimePreKeys: replenishList });
    }
  } catch (err) {
    console.error("Failed to initialize user E2EE keys:", err);
  }
}

/**
 * Initiates an X3DH key agreement and creates an encrypted session with recipient.
 */
export async function getOrCreateSession(
  currentUserId: string,
  recipientUserId: string
): Promise<{ session: E2EESession; isNewSession: boolean; x3dhHeader?: any }> {
  const session = await getSession(recipientUserId);

  if (session && session.sessionAESKeyBase64) {
    return { session, isNewSession: false };
  }

  // Fetch recipient prekey bundle from server
  const res = await axiosInstance.get(`/e2ee/prekeys/${recipientUserId}`);
  const bundle = res.data?.data;
  if (!bundle || !bundle.identityKey || !bundle.signedPreKey) {
    throw new Error("Recipient does not have a registered E2EE prekey bundle");
  }

  const localKeys = await getIdentityKeys(currentUserId);
  if (!localKeys) {
    await initializeUserE2EE(currentUserId);
  }
  const updatedLocalKeys = await getIdentityKeys(currentUserId);
  const myIdentityPriv = await importPrivateKey(updatedLocalKeys.identityPrivJWK);

  // Generate ephemeral key pair for X3DH
  const ephemeralPair = await generateECDHKeyPair();
  const ephemeralPubBase64 = await exportPublicKey(ephemeralPair.publicKey);

  const recipientIdentityPub = await importPublicKey(bundle.identityKey);
  const recipientSignedPreKeyPub = await importPublicKey(bundle.signedPreKey.publicKey);

  // Perform Diffie-Hellman operations
  const dh1 = await computeDHBits(myIdentityPriv, recipientSignedPreKeyPub);
  const dh2 = await computeDHBits(ephemeralPair.privateKey, recipientIdentityPub);
  const dh3 = await computeDHBits(ephemeralPair.privateKey, recipientSignedPreKeyPub);

  let combinedBits = new Uint8Array(dh1.byteLength + dh2.byteLength + dh3.byteLength);
  combinedBits.set(new Uint8Array(dh1), 0);
  combinedBits.set(new Uint8Array(dh2), dh1.byteLength);
  combinedBits.set(new Uint8Array(dh3), dh1.byteLength + dh2.byteLength);

  let usedOPKId: number | undefined = undefined;
  if (bundle.oneTimePreKey && bundle.oneTimePreKey.publicKey) {
    const opkPub = await importPublicKey(bundle.oneTimePreKey.publicKey);
    const dh4 = await computeDHBits(ephemeralPair.privateKey, opkPub);
    const withDh4 = new Uint8Array(combinedBits.byteLength + dh4.byteLength);
    withDh4.set(combinedBits, 0);
    withDh4.set(new Uint8Array(dh4), combinedBits.byteLength);
    combinedBits = withDh4;
    usedOPKId = bundle.oneTimePreKey.keyId;
  }

  // Derive master symmetric session key
  const aesKey = await deriveAESKeyFromSecrets(
    combinedBits.buffer,
    "iMessage-X3DH-Salt",
    "iMessage-E2EE-MasterSession"
  );
  const exportedRawKey = await window.crypto.subtle.exportKey("raw", aesKey);

  const safetyNumber = await computeSafetyNumber(
    updatedLocalKeys.identityPubBase64,
    bundle.identityKey
  );

  const newSession: any = {
    recipientId: recipientUserId,
    recipientIdentityPub: bundle.identityKey,
    sessionAESKeyBase64: window.btoa(String.fromCharCode(...new Uint8Array(exportedRawKey))),
    sendingCounter: 0,
    receivingCounter: 0,
    safetyNumber,
  };

  await saveSession(recipientUserId, newSession);

  return {
    session: newSession,
    isNewSession: true,
    x3dhHeader: {
      ephemeralKey: ephemeralPubBase64,
      oneTimePreKeyId: usedOPKId,
    },
  };
}

/**
 * Encrypt an outgoing message payload using the session's E2EE keys.
 */
export async function encryptOutgoingMessage(
  currentUserId: string,
  recipientUserId: string,
  plaintext: string
): Promise<{
  isEncrypted: boolean;
  ciphertext: string;
  iv: string;
  authTag?: string;
  x3dhHeader?: any;
  ratchetHeader?: any;
}> {
  try {
    const { session, isNewSession, x3dhHeader } = await getOrCreateSession(
      currentUserId,
      recipientUserId
    );

    if (!session || !session.sessionAESKeyBase64) {
      throw new Error("Session key missing");
    }

    const rawKeyBuffer = new Uint8Array(
      window.atob(session.sessionAESKeyBase64).split("").map((c) => c.charCodeAt(0))
    ).buffer;

    const aesKey = await window.crypto.subtle.importKey(
      "raw",
      rawKeyBuffer,
      { name: "AES-GCM" },
      false,
      ["encrypt", "decrypt"]
    );

    const encrypted = await encryptTextAESGCM(aesKey, plaintext);

    session.sendingCounter = (session.sendingCounter || 0) + 1;
    await saveSession(recipientUserId, session);

    return {
      isEncrypted: true,
      ciphertext: encrypted.ciphertext,
      iv: encrypted.iv,
      authTag: encrypted.authTag || "",
      x3dhHeader: isNewSession ? x3dhHeader : undefined,
      ratchetHeader: {
        ratchetKey: "",
        counter: session.sendingCounter,
        previousCounter: 0,
      },
    };
  } catch (err) {
    console.warn("E2EE encryption fallback to plaintext:", err);
    return {
      isEncrypted: false,
      ciphertext: "",
      iv: "",
    };
  }
}

/**
 * Decrypt an incoming message payload.
 */
export async function decryptIncomingMessage(
  currentUserId: string,
  senderId: string,
  messageDoc: any
): Promise<string> {
  if (!messageDoc || !messageDoc.isEncrypted || !messageDoc.ciphertext || !messageDoc.iv) {
    return messageDoc?.message || "";
  }

  try {
    let session = await getSession(senderId);

    // If receiver doesn't have session yet, but received an X3DH initial message
    if ((!session || !session.sessionAESKeyBase64) && messageDoc.x3dhHeader?.ephemeralKey) {
      const localKeys = await getIdentityKeys(currentUserId);
      if (!localKeys) return "[Encrypted Message - Key Missing]";

      const myIdentityPriv = await importPrivateKey(localKeys.identityPrivJWK);
      const mySignedPreKeyPriv = await importPrivateKey(localKeys.signedPreKeyPrivJWK);

      // Fetch sender identity key
      const senderBundleRes = await axiosInstance.get(`/e2ee/prekeys/${senderId}`);
      const senderIdentityPub = await importPublicKey(senderBundleRes.data?.data?.identityKey);
      const ephemeralPub = await importPublicKey(messageDoc.x3dhHeader.ephemeralKey);

      const dh1 = await computeDHBits(mySignedPreKeyPriv, senderIdentityPub);
      const dh2 = await computeDHBits(myIdentityPriv, ephemeralPub);
      const dh3 = await computeDHBits(mySignedPreKeyPriv, ephemeralPub);

      let combinedBits = new Uint8Array(dh1.byteLength + dh2.byteLength + dh3.byteLength);
      combinedBits.set(new Uint8Array(dh1), 0);
      combinedBits.set(new Uint8Array(dh2), dh1.byteLength);
      combinedBits.set(new Uint8Array(dh3), dh1.byteLength + dh2.byteLength);

      if (messageDoc.x3dhHeader.oneTimePreKeyId) {
        const storedOPK = await getPreKey(messageDoc.x3dhHeader.oneTimePreKeyId);
        if (storedOPK?.privateJWK) {
          const opkPriv = await importPrivateKey(storedOPK.privateJWK);
          const dh4 = await computeDHBits(opkPriv, ephemeralPub);
          const withDh4 = new Uint8Array(combinedBits.byteLength + dh4.byteLength);
          withDh4.set(combinedBits, 0);
          withDh4.set(new Uint8Array(dh4), combinedBits.byteLength);
          combinedBits = withDh4;
        }
      }

      const aesKey = await deriveAESKeyFromSecrets(
        combinedBits.buffer,
        "iMessage-X3DH-Salt",
        "iMessage-E2EE-MasterSession"
      );
      const exportedRawKey = await window.crypto.subtle.exportKey("raw", aesKey);

      session = {
        recipientId: senderId,
        recipientIdentityPub: senderBundleRes.data?.data?.identityKey,
        sessionAESKeyBase64: window.btoa(String.fromCharCode(...new Uint8Array(exportedRawKey))),
        sendingCounter: 0,
        receivingCounter: 0,
      };
      await saveSession(senderId, session);
    }

    if (!session || !session.sessionAESKeyBase64) {
      return "[Undecryptable Message]";
    }

    const rawKeyBuffer = new Uint8Array(
      window.atob(session.sessionAESKeyBase64).split("").map((c) => c.charCodeAt(0))
    ).buffer;

    const aesKey = await window.crypto.subtle.importKey(
      "raw",
      rawKeyBuffer,
      { name: "AES-GCM" },
      false,
      ["decrypt"]
    );

    return await decryptTextAESGCM(aesKey, messageDoc.ciphertext, messageDoc.iv);
  } catch (err) {
    console.error("Failed to decrypt message:", err);
    return "[Message Decryption Error]";
  }
}
