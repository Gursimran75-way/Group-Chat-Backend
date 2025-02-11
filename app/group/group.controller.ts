import * as groupService from "./group.service";
import { createResponse } from "../common/helper/response.hepler";
import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import createHttpError from "http-errors";
import { IUser } from "../user/user.dto";

interface IUserWithoutPassword extends Omit<IUser, "password"> {}

export const getPublicGroups = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await groupService.getPublicGroups();
    res.send(createResponse(result, "Public groups fetched successfully"));
  }
);

export const createGroup = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw createHttpError(401, "Unauthorized");
  const result = await groupService.createGroup(
    req.user as IUserWithoutPassword,
    req.body
  );
  res.send(createResponse(result, "Group created successfully"));
});

export const joinPublicGroup = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) throw createHttpError(401, "Unauthorized");
    const result = await groupService.joinPublicGroup(
      req.user as IUserWithoutPassword,
      req.params.groupId
    );
    res.send(createResponse(result, "Joined public group successfully"));
  }
);

export const createInvitation = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) throw createHttpError(401, "Unauthorized");
    const result = await groupService.createInvitation(
      req.user as IUserWithoutPassword,
      req.params.groupId,
      req.params.userId
    );
    res.send(createResponse(result, "Invitation created successfully"));
  }
);

export const acceptInvitation = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await groupService.acceptInvitation(
      req.params.token,
      req.body
    );
    res.send(createResponse(result, "Invitation accepted successfully"));
  }
);
export const analytics = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await groupService.analytics(
      req.user as IUserWithoutPassword
    );
    res.send(createResponse(result, "analytics fetched successfully"));
  }
);

export const groupAnalytics = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await groupService.groupAnalytics(
      req.params.groupId,
    );
    res.send(createResponse(result, "group analytics fetched successfully"));
  }
);
