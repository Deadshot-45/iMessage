import mongoose, { Schema, Document } from "mongoose";

export type MessageStatus = "sent" | "delivered" | "seen";
export type MediaType = "image" | "video" | "audio" | "gif";

export interface IMessage extends Document {
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  message: string;
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