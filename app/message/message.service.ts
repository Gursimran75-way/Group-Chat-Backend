import Message from "./message.schema";
import { type IUser } from "../user/user.dto";
import createHttpError from "http-errors";
import mongoose from "mongoose";
import { checkUserExistInGroup, isGroupExist } from "../group/group.service";
import { IGroup } from "../group/group.dto";

interface IUserWithoutPassword extends Omit<IUser, "password"> {}

// Get all public groups
export const createMessage = async (
  user: IUserWithoutPassword,
  data: {
    content: string;
    groupId: string;
  }
) => {
  if (!user) throw createHttpError(401, "Unauthorized");
  const isUserExistInGroup = await checkUserExistInGroup(
    data.groupId,
    user._id
  );
  if (!isUserExistInGroup)
    throw createHttpError(400, "User is not in the group");
  const message = new Message({
    groupId: data.groupId,
    senderId: user._id,
    content: data.content,
  });

  return await message.save();
};

export const getAllMessages = async (
  user: IUserWithoutPassword,
  data: {
    groupId: string;
  }
) => {
  if (!user) throw createHttpError(401, "Unauthorized");

  const isGroup = await isGroupExist(data.groupId);
  if(!isGroup)
    throw createHttpError(400, "Group not found");

  return await Message.find({ groupId: data.groupId }).sort({ createdAt: 1 });
};

export const deleteMessageAssociateWithGroup = async (
  groupId: string
) => {
  await Message.deleteMany({ groupId });
};
