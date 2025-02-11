import Group from "./group.schema";
import crypto from "crypto";
import { type IUser } from "../user/user.dto";
import createHttpError from "http-errors";
import mongoose from "mongoose";
import { getUserByEmail, removeGroupIdFromEachMember, updateUserGroup } from "../user/user.service";
import { deleteMessageAssociateWithGroup } from "../message/message.service";

interface IUserWithoutPassword extends Omit<IUser, "password"> {}

// Get all public groups
export const getPublicGroups = async () => {
  return await Group.find({ type: "public" });
};

// Create a group
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

// Join a public group
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

// Create an invitation link for a private group
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

// Accept an invitation
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

// fetch analytics
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


export const checkUserExistInGroup = async (
  groupId: string,
  userId: string
) => {
  const group = await Group.findById(groupId);
  if (!group) throw new Error("Group not found");

  return group.members.some((member) => member.toString() === userId);
};

export const isGroupExist = async (
  groupId: string,
) => {
  const group = await Group.findById(groupId);

  if(!group){
    return false;
  }
  return true;
};

export const editGroup = async (
  groupId: string,
  data: { name: string }
) => {
  const group = await Group.findByIdAndUpdate({_id:groupId}, {name: data.name}, {new: true});

  return { group };
};

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

