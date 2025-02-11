import { type BaseSchema } from "../common/dto/base.dto";
import mongoose from "mongoose";


interface Invitation {
  userId: mongoose.Types.ObjectId;
  token: string;
  expiresAt: Date
}

export interface IGroup extends BaseSchema {
  name: string;
  type: "public" | "private";
  admin: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  inviteToken?: Invitation[];
  // joinRequests?: mongoose.Types.ObjectId[];
}
