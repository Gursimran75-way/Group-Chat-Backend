import mongoose, { Schema, Document } from "mongoose";
import { type IGroup } from "./group.dto";


const GroupSchema = new Schema<IGroup>(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ["public", "private"], required: true },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    inviteToken: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        token: { type: String, required: true },
        expiresAt: { type: Date, required: true },
      },
    ],
    // joinRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export default mongoose.model<IGroup>("Group", GroupSchema);
