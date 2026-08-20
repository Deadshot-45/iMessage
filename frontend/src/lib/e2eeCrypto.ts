/**
 * Web Cryptography API (SubtleCrypto) based E2EE Cryptographic Primitives Engine
 */

export function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Generate ECDH Key Pair for Identity or Prekeys
export async function generateECDHKeyPair(): Promise<CryptoKeyPair> {
  return await window.crypto.subtle.generateKey(
    {
      name: "ECDH",
      namedCurve: "P-256",
    },
    true, // extractable for local client storage
    ["deriveKey", "deriveBits"]
  );
}

// Export Public Key to Raw/Base64
export async function exportPublicKey(key: CryptoKey): Promise<string> {
  const exported = await window.crypto.subtle.exportKey("spki", key);
  return arrayBufferToBase64(exported);
}

// Import Public Key from Base64
export async function importPublicKey(base64Key: string): Promise<CryptoKey> {
  const buffer = base64ToArrayBuffer(base64Key);
  return await window.crypto.subtle.importKey(
    "spki",
    buffer,
    {
      name: "ECDH",
      namedCurve: "P-256",
    },
    true,
    []
  );
}

// Export Private Key to JWK
export async function exportPrivateKey(key: CryptoKey): Promise<JsonWebKey> {
  return await window.crypto.subtle.exportKey("jwk", key);
}

// Import Private Key from JWK
export async function importPrivateKey(jwk: JsonWebKey): Promise<CryptoKey> {
  return await window.crypto.subtle.importKey(
    "jwk",
    jwk,
    {
      name: "ECDH",
      namedCurve: "P-256",
    },
    true,
    ["deriveKey", "deriveBits"]
  );
}

// Compute Diffie-Hellman Shared Secret Bits
export async function computeDHBits(
  privateKey: CryptoKey,
  publicKey: CryptoKey
): Promise<ArrayBuffer> {
  return await window.crypto.subtle.deriveBits(
    {
      name: "ECDH",
      public: publicKey,
    },
    privateKey,
    256 // 256 bits
  );
}

// Derive AES-GCM Key using HKDF from combined shared secrets
export async function deriveAESKeyFromSecrets(
  combinedBits: ArrayBuffer,
  saltStr: string,
  infoStr: string
): Promise<CryptoKey> {
  const ikmKey = await window.crypto.subtle.importKey(
    "raw",
    combinedBits,
    { name: "HKDF" },
    false,
    ["deriveKey"]
  );

  const encoder = new TextEncoder();
  return await window.crypto.subtle.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: encoder.encode(saltStr),
      info: encoder.encode(infoStr),
    },
    ikmKey,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

// Encrypt plaintext string with AES-256-GCM
export async function encryptTextAESGCM(
  key: CryptoKey,
  plaintext: string
): Promise<{ ciphertext: string; iv: string; authTag?: string }> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);
  const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit standard IV

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: "AES-256-GCM",
      iv,
    },
    key,
    data
  );

  return {
    ciphertext: arrayBufferToBase64(encryptedBuffer),
    iv: arrayBufferToBase64(iv),
  };
}

// Decrypt ciphertext string with AES-256-GCM
export async function decryptTextAESGCM(
  key: CryptoKey,
  ciphertextBase64: string,
  ivBase64: string
): Promise<string> {
  const ciphertextBuffer = base64ToArrayBuffer(ciphertextBase64);
  const ivBuffer = base64ToArrayBuffer(ivBase64);

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: "AES-256-GCM",
      iv: new Uint8Array(ivBuffer),
    },
    key,
    ciphertextBuffer
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
}

// Out-of-band Media File Encryption
export async function encryptMediaFile(
  file: File
): Promise<{ encryptedBlob: Blob; mediaKeyBase64: string; ivBase64: string; sha256: string }> {
  const mediaKey = await window.crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );

  const rawMediaKey = await window.crypto.subtle.exportKey("raw", mediaKey);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const fileBuffer = await file.arrayBuffer();

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    mediaKey,
    fileBuffer
  );

  const hashBuffer = await window.crypto.subtle.digest("SHA-256", encryptedBuffer);
  const sha256 = arrayBufferToBase64(hashBuffer);

  const encryptedBlob = new Blob([encryptedBuffer], { type: "application/octet-stream" });

  return {
    encryptedBlob,
    mediaKeyBase64: arrayBufferToBase64(rawMediaKey),
    ivBase64: arrayBufferToBase64(iv),
    sha256,
  };
}

// Out-of-band Media File Decryption
export async function decryptMediaBlob(
  encryptedBlob: Blob,
  mediaKeyBase64: string,
  ivBase64: string,
  expectedMimeType: string = "image/jpeg"
): Promise<Blob> {
  const rawKeyBuffer = base64ToArrayBuffer(mediaKeyBase64);
  const ivBuffer = base64ToArrayBuffer(ivBase64);
  const encryptedBuffer = await encryptedBlob.arrayBuffer();

  const mediaKey = await window.crypto.subtle.importKey(
    "raw",
    rawKeyBuffer,
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: new Uint8Array(ivBuffer) },
    mediaKey,
    encryptedBuffer
  );

  return new Blob([decryptedBuffer], { type: expectedMimeType });
}

// Calculate Deterministic 60-digit Safety Number / Fingerprint for MITM verification
export async function computeSafetyNumber(
  aliceIdentityPubBase64: string,
  bobIdentityPubBase64: string
): Promise<string> {
  const sorted = [aliceIdentityPubBase64, bobIdentityPubBase64].sort().join("");
  const encoder = new TextEncoder();
  const hash = await window.crypto.subtle.digest("SHA-512", encoder.encode(sorted));
  const bytes = new Uint8Array(hash);

  // Convert hash bytes into 12 blocks of 5-digit numbers
  const blocks: string[] = [];
  for (let i = 0; i < 12; i++) {
    const slice = (bytes[i * 4] << 24) | (bytes[i * 4 + 1] << 16) | (bytes[i * 4 + 2] << 8) | bytes[i * 4 + 3];
    const positiveNum = Math.abs(slice) % 100000;
    blocks.push(positiveNum.toString().padStart(5, "0"));
  }

  return blocks.join("-");
}
