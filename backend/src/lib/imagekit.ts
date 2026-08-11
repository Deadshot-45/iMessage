import ImageKit, { toFile } from "@imagekit/nodejs";

const imagekit = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
});

const hasImagekitConfig = () => {
  return Boolean(process.env.IMAGEKIT_PRIVATE_KEY);
};

const createFileName = (orgName = "upload") => {
  const safeName = orgName.trim().replace(/\s+/g, "_");
  return `chat-${Date.now()}/${safeName}`;
};

const uploadChatMedia = async (file: any) => {
  const fileName = createFileName(file.name);
  const response = imagekit.files.upload({
    file: await toFile(file.buffer, fileName, { type: file.mimetype }),
    fileName,
    folder: "chat_media",
  });
  return response;
};

export { hasImagekitConfig, uploadChatMedia };
