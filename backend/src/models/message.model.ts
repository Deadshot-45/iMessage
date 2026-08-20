import mongoose, { Schema, Document } from "mongoose";

export type MessageStatus = "sent" | "delivered" | "seen";
export type MediaType = "image" | "video" | "audio" | "gif";

export interface IRatchetHeader {
  ratchetKey: string; // Base64 Ephemeral Public Key for this turn
  counter: number; // Message counter in the current sending chain
  previousCounter: number; // Length of previous sending chain
}

export interface IX3DHHeader {
  ephemeralKey?: string; // Base64 Alice ephemeral key if initial session
  oneTimePreKeyId?: number; // Prekey ID used by Alice if initial session
}

export interface IMessage extends Document {
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  message: string; // Fallback / Plaintext (if unencrypted) or empty
  
  // E2EE Envelope Fields
  isEncrypted: boolean;
  ciphertext?: string; // Base64 encoded AES-256-GCM ciphertext
  iv?: string; // Base64 encoded 96-bit IV
  authTag?: string; // Base64 encoded 128-bit AEAD Auth Tag
  ratchetHeader?: IRatchetHeader;
  x3dhHeader?: IX3DHHeader;
  mediaKeyCiphertext?: string; // Base64 encrypted media metadata key

  mediaUrl?: string;
  mediaType?: MediaType;
  thumbnailUrl?: string;
  mediaSize?: number;
  mediaDuration?: number;
  status: MessageStatus;
  deliveredAt?: Date;
  readAt?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    message: {
      type: String,
      default: "",
    },
    isEncrypted: {
      type: Boolean,
      default: false,
      index: true,
    },
    ciphertext: {
      type: String,
      default: "",
    },
    iv: {
      type: String,
      default: "",
    },
    authTag: {
      type: String,
      default: "",
    },
    ratchetHeader: {
      ratchetKey: { type: String, default: "" },
      counter: { type: Number, default: 0 },
      previousCounter: { type: Number, default: 0 },
    },
    x3dhHeader: {
      ephemeralKey: { type: String },
      oneTimePreKeyId: { type: Number },
    },
    mediaKeyCiphertext: {
      type: String,
      default: "",
    },
    mediaUrl: {
      type: String,
      default: "",
    },
    mediaType: {
      type: String,
      enum: ["image", "video", "audio", "gif"],
    },
    thumbnailUrl: {
      type: String,
      default: "",
    },
    mediaSize: {
      type: Number,
      default: 0,
    },
    mediaDuration: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["sent", "delivered", "seen"],
      default: "sent",
      index: true,
    },
    deliveredAt: {
      type: Date,
    },
    readAt: {
      type: Date,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

messageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });
messageSchema.index({ receiverId: 1, status: 1 });

const Message = mongoose.model<IMessage>("Message", messageSchema);

export default Message;
