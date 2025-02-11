import Message from "./message.schema";
import { type IUser } from "../user/user.dto";
import createHttpError from "http-errors";
import mongoose from "mongoose";
import { checkUserExistInGroup, isGroupExist } from "../group/group.service";
import { IGroup } from "../group/group.dto";

interface IUserWithoutPassword extends Omit<IUser, "password"> {}

/**
 * Creates a new message in a group.
 *
 * @param {IUserWithoutPassword} user - The user sending the message.
 * @param {Object} data - The details of the message being created.
 * @param {string} data.content - The content of the message.
 * @param {string} data.groupId - The ID of the group to which the message belongs.
 * @returns {Promise<IMessage>} - The newly created message document.
 * @throws {createHttpError} - Throws an error if the user is unauthorized or not in the group.
 */
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

/**
 * Get all messages in a group.
 *
 * @param {IUserWithoutPassword} user - The user requesting the messages.
 * @param {Object} data - The details of the group whose messages are being fetched.
 * @param {string} data.groupId - The ID of the group.
 * @returns {Promise<IMessage[]>} - All messages in the group.
 * @throws {createHttpError} - Throws an error if the user is unauthorized or the group is not found.
 */
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

/**
 * Deletes a message by GroupId.
 *
 * @param {string} groupId - Group ID.
 */
export const deleteMessageAssociateWithGroup = async (
  groupId: string
) => {
  await Message.deleteMany({ groupId });
};
