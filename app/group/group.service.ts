import Group from "./group.schema";
import crypto from "crypto";
import { type IUser } from "../user/user.dto";
import createHttpError from "http-errors";
import mongoose from "mongoose";
import { getUserByEmail, removeGroupIdFromEachMember, updateUserGroup } from "../user/user.service";
import { deleteMessageAssociateWithGroup } from "../message/message.service";

interface IUserWithoutPassword extends Omit<IUser, "password"> {}


/**
 * Get all public groups
 *
 * @returns {Promise<import("./group.dto").IGroup[]>}
 */
export const getPublicGroups = async () => {
  return await Group.find({ type: "public" });
};

/**
 * Creates a new group and assigns the user as the admin and a member.
 *
 * @param {IUserWithoutPassword} user - The user creating the group, who will be set as the admin and a member.
 * @param {Object} data - The details of the group being created.
 * @param {string} data.name - The name of the group.
 * @param {string} data.type - The type of the group (e.g., "public" or "private").
 * @returns {Promise<IGroup>} - The newly created group document.
 * @throws {createHttpError} - Throws an error if the user is not authorized.
 */

export const createGroup = async (
  user: IUserWithoutPassword,
  data: { name: string; type: string }
) => {
  if (!user) throw createHttpError(401, "Unauthorized");

  const group = new Group({
    name: data.name,
    type: data.type,
    admin: user._id,
    members: [user._id],
  });

  const savedGroup = await group.save();

  await updateUserGroup(user._id, savedGroup._id);

  return savedGroup;
};


/**
 * Allows a user to join a public group if they are not already a member.
 *
 * @param {IUserWithoutPassword} user - The user attempting to join the group.
 * @param {string} groupId - The ID of the group to join.
 * @returns {Promise<Object>} - A success message if the user joins the group.
 * @throws {createHttpError} - Throws an error if the user is unauthorized, the group is not found, the group is private, or the user is already a member.
 */

export const joinPublicGroup = async (
  user: IUserWithoutPassword,
  groupId: string
) => {
  if (!user) throw createHttpError(401, "Unauthorized");

  const group = await Group.findById(groupId);
  if (!group) throw createHttpError(404, "Group not found");

  if (group.type !== "public")
    throw createHttpError(400, "Cannot join a private group directly");

  const userIdObject = new mongoose.Types.ObjectId(user._id);
  if (group.members.includes(userIdObject))
    throw createHttpError(400, "Already a member");

  group.members.push(userIdObject);
  await group.save();

  await updateUserGroup(user._id, group._id);

  return { message: "Joined the group successfully" };
};


/**
 * Creates an invitation for a user to join a group.
 *
 * @param {IUserWithoutPassword} user - The user creating the invitation, must be the admin of the group.
 * @param {string} groupId - The ID of the group to which the invitation is being created.
 * @param {string} userId - The ID of the user being invited to the group.
 * @returns {Promise<Object>} - An object containing a frontend link and an invitation link.
 */

export const createInvitation = async (
  user: IUserWithoutPassword,
  groupId: string,
  userId: string
) => {
  if (!user) throw createHttpError(401, "Unauthorized");

  const group = await Group.findById(groupId);
  if (!group) throw createHttpError(404, "Group not found");

  if (group.admin.toString() !== user._id.toString()) {
    throw createHttpError(403, "Only the admin can invite users");
  }

  const userIdObject = new mongoose.Types.ObjectId(userId);
  if (group.members.includes(userIdObject))
    throw createHttpError(400, "Already a member");

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24); // Expires in 24 hours

  group.inviteToken?.push({ userId: userIdObject, token, expiresAt });
  await group.save();

  return {
    frontendLink: "dummy.com",
    invitationLink: `/api/groups/accept-invitation/${token}`,
  };
};

/**
 * Accepts an invitation to join a group.
 *
 * @param {string} token - The invitation token.
 * @param {Object} data - The user's email address.
 * @param {string} data.email - The email address of the user accepting the invitation.
 * @returns {Promise<Object>} - A success message if the user joins the group.
 * @throws {createHttpError} - Throws an error if the user is unauthorized, the invitation is invalid or expired, or the user is not authorized to use the invitation.
 */
export const acceptInvitation = async (
  token: string,
  data: { email: string }
) => {
  const user = await getUserByEmail(data.email);
  if (!user) throw createHttpError(401, "Unauthorized");

  const group = await Group.findOne({ "inviteToken.token": token });
  if (!group) throw createHttpError(404, "Invalid or expired invitation");

  const invitation = group.inviteToken?.find((inv) => inv.token === token);
  if (!invitation || new Date() > invitation.expiresAt) {
    throw createHttpError(400, "Invitation expired");
  }

  if (invitation.userId.toString() !== user._id.toString()) {
    throw createHttpError(403, "You are not authorized to use this invitation");
  }

  const userIdObject = new mongoose.Types.ObjectId(user._id);
  if (group.members.includes(userIdObject)) {
    throw createHttpError(400, "You are already a member of this group");
  }

  group.members.push(userIdObject);

  group.inviteToken =
    group.inviteToken?.filter((inv) => inv.token !== token) ?? [];

  await group.save();

  await updateUserGroup(user._id, group._id);

  return { message: "Joined the group successfully" };
};

/**
 * Get analytics for a user, including the total number of groups created and the number of members in each group.
 *
 * @param {IUserWithoutPassword} user - The user for whom analytics are being fetched.
 * @returns {Promise<Object>} - An object containing the total number of groups created and an array of group analytics.
 * @throws {createHttpError} - Throws an error if the user is unauthorized.
 */
export const analytics = async (user: IUserWithoutPassword) => {
  const userId = user?._id;
  if (!userId) throw createHttpError(401, "Unauthorized");

  const totalGroupsCreated = await Group.countDocuments({ admin: userId });

  const groups = await Group.find({ admin: userId }).select("name members");

  const groupUserCounts = groups.map((group) => ({
    groupId: group._id,
    name: group.name,
    totalMembers: group.members.length,
  }));
  return { totalGroupsCreated, groupUserCounts };
};

/**
 * Get analytics for a group, including the group's admin and members.
 *
 * @param {string} groupId - The ID of the group for which analytics are being fetched.
 * @returns {Promise<Object>} - An object containing the group's admin and members.
 * @throws {createHttpError} - Throws an error if the group is not found.
 */
export const groupAnalytics = async (groupId: string) => {
  console.log(groupId)
  const group = await Group.findById(groupId)
  .populate("admin", "-password -refreshToken") 
  .populate("members", "-password -refreshToken");


    if (!group) {
      throw createHttpError(400, "group not found");
    }

    return { group };
};


/**
 * Checks if a user is a member of a group.
 *
 * @param {string} groupId - The ID of the group.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<boolean>} - A boolean indicating whether the user is a member of the group.
 */
export const checkUserExistInGroup = async (
  groupId: string,
  userId: string
) => {
  const group = await Group.findById(groupId);
  if (!group) throw new Error("Group not found");

  return group.members.some((member) => member.toString() === userId);
};

/**
 * Checks if a group exists.
 *
 * @param {string} groupId - The ID of the group.
 * @returns {Promise<boolean>} - A boolean indicating whether the group exists.
 */
export const isGroupExist = async (
  groupId: string,
) => {
  const group = await Group.findById(groupId);

  if(!group){
    return false;
  }
  return true;
};

/**
 * edit group name.
 *
 * @param {string} groupId - The ID of the group.
 * @param {string} data.name - The name of the group.
 * @returns {Promise<boolean>} - A boolean indicating whether the group exists.
 */
export const editGroup = async (
  groupId: string,
  data: { name: string }
) => {
  const group = await Group.findByIdAndUpdate({_id:groupId}, {name: data.name}, {new: true});

  return { group };
};

/**
 * delete group.
 *
 * @param {string} groupId - The ID of the group.
 * @param {IUserWithoutPassword} user - The user for whom analytics are being fetched.
 * @returns {Promise<boolean>} - A boolean indicating whether the group exists.
 */
export const deleteGroup = async (
  groupId: string,
  user: IUserWithoutPassword,
) => {
  
  const group = await Group.findById(groupId);
  if (!group) {
    throw createHttpError(400, "Group not found");
  }

  if (group.admin.toString() !== user._id.toString()) {
    throw createHttpError(403, "Only the admin can delete the group");
  }

    // Remove the group ID from each member's group field
    await removeGroupIdFromEachMember(group);
    

    // Delete all messages associated with the group
    await deleteMessageAssociateWithGroup(groupId);
    
    // Delete the group from the database
    await Group.findByIdAndDelete(groupId);

    return {}
};

