import ImageKit, { toFile } from "@imagekit/nodejs";
import { createHmac } from "crypto";

const imagekit = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY as string,
});

const hasImagekitConfig = () => {
  return Boolean(process.env.IMAGEKIT_PRIVATE_KEY);
};

const createFileName = (orgName = "upload") => {
  const safeName = orgName.trim().replace(/\s+/g, "_");
  return `chat-${Date.now()}/${safeName}`;
};

const uploadChatMedia = async (file: any) => {
  const fileName = createFileName(file.originalname);
  const response = imagekit.files.upload({
    file: await toFile(file.buffer, fileName, { type: file.mimetype }),
    fileName,
    folder: "chat_media",
  });
  return response;
};

/**
 * Generates a short-lived auth signature for direct client-side ImageKit uploads.
 * The client uses this token to upload directly to ImageKit CDN, skipping the server hop.
 * Spec: https://imagekit.io/docs/upload-file#uploading-file-via-api
 */
const getAuthParams = () => {
  const IMAGEKIT_PUBLIC_KEY = process.env.IMAGEKIT_PUBLIC_KEY || "";
  const IMAGEKIT_PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY || "";
  const IMGKIT_ID = process.env.IMGKIT || "";
  // Token = random UUID, expire = unix timestamp + 5 min
  const token = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const expire = Math.floor(Date.now() / 1000) + 300;
  // ImageKit signature: HMAC-SHA1(privateKey, token + expire)
  const signature = createHmac("sha1", IMAGEKIT_PRIVATE_KEY)
    .update(token + expire)
    .digest("hex");
  return {
    token,
    expire,
    signature,
    publicKey: IMAGEKIT_PUBLIC_KEY,
    urlEndpoint: `https://ik.imagekit.io/${IMGKIT_ID}`,
  };
};

export { hasImagekitConfig, uploadChatMedia, getAuthParams };
