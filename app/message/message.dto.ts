import { type BaseSchema } from "../common/dto/base.dto";
import mongoose from "mongoose";

export interface IMessage extends BaseSchema {
    groupId: mongoose.Types.ObjectId;
    senderId: mongoose.Types.ObjectId;
    content: string;
}
