import * as messageService from "./message.service";
import { createResponse } from "../common/helper/response.hepler";
import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import createHttpError from "http-errors";
import { IUser } from "../user/user.dto";

interface IUserWithoutPassword extends Omit<IUser, "password"> {}

export const createMessage = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await messageService.createMessage(req.user as IUserWithoutPassword,req.body);
    res.send(createResponse(result, "Message sent successfully"));
  }
);

export const getAllMessages = asyncHandler(
  async (req: Request, res: Response) => {
    const messages = await messageService.getAllMessages(req.user as IUserWithoutPassword,req.body);
    res.send(createResponse(messages, "Messages fetched successfully"));
  }
);