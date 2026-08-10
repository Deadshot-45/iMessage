import mongoose from "mongoose";

const Schema = new mongoose.Schema(
  {
    clerkId: {
      type: String,
      require: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    profilePic: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

const model = mongoose.model("User", Schema);
export default model;
