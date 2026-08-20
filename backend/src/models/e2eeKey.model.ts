import mongoose, { Schema, Document } from "mongoose";

export interface IOneTimePreKey {
  keyId: number;
  publicKey: string;
  consumed: boolean;
  consumedAt?: Date;
}

export interface ISignedPreKey {
  keyId: number;
  publicKey: string;
  signature: string;
  createdAt: Date;
}

export interface IE2EEKey extends Document {
  userId: mongoose.Types.ObjectId;
  identityKey: string; // Base64 Curve25519 Public Key
  signedPreKey: ISignedPreKey;
  oneTimePreKeys: IOneTimePreKey[];
  createdAt: Date;
  updatedAt: Date;
}

const oneTimePreKeySchema = new Schema<IOneTimePreKey>(
  {
    keyId: { type: Number, required: true },
    publicKey: { type: String, required: true },
    consumed: { type: Boolean, default: false },
    consumedAt: { type: Date },
  },
  { _id: false }
);

const signedPreKeySchema = new Schema<ISignedPreKey>(
  {
    keyId: { type: Number, required: true },
    publicKey: { type: String, required: true },
    signature: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const e2eeKeySchema = new Schema<IE2EEKey>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    identityKey: {
      type: String,
      required: true,
    },
    signedPreKey: {
      type: signedPreKeySchema,
      required: true,
    },
    oneTimePreKeys: [oneTimePreKeySchema],
  },
  { timestamps: true }
);

// Compound index for querying active unconsumed prekeys efficiently
e2eeKeySchema.index({ userId: 1, "oneTimePreKeys.consumed": 1 });

const E2EEKey = mongoose.model<IE2EEKey>("E2EEKey", e2eeKeySchema);

export default E2EEKey;
