import mongoose from "mongoose";

export interface IUser extends mongoose.Document {
  username: string;
  fullName: string;
  email: string;
  password?: string;
  profilePic?: string;
  avatarColor?: string;
  createdAt: Date;
  updatedAt: Date;
}

const Schema = new mongoose.Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    profilePic: {
      type: String,
      default: "",
    },
    avatarColor: {
      type: String,
      default: "#007aff",
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model<IUser>("User", Schema);
export default User;
