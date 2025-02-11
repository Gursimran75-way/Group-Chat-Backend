import mongoose, { Schema, Document } from "mongoose";
import { type IMessage } from "./message.dto"; 

const MessageSchema = new Schema<IMessage>(
  {
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IMessage>("Message", MessageSchema);
