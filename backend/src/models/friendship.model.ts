import mongoose, { Schema, Document } from "mongoose";

export type FriendshipStatus = "pending" | "accepted" | "declined" | "blocked";

export interface IFriendship extends Document {
  requester: mongoose.Types.ObjectId; // User who initiated the request
  recipient: mongoose.Types.ObjectId; // User who receives the request
  status: FriendshipStatus;
  createdAt: Date;
  updatedAt: Date;
}

const friendshipSchema = new Schema<IFriendship>(
  {
    requester: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "blocked"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true },
);

// Prevent duplicate friendship pairs in a specific direction
friendshipSchema.index({ requester: 1, recipient: 1 }, { unique: true });

// Optimize querying all friendships involving a given user
friendshipSchema.index({ requester: 1, status: 1 });
friendshipSchema.index({ recipient: 1, status: 1 });

const Friendship = mongoose.model<IFriendship>("Friendship", friendshipSchema);
export default Friendship;
