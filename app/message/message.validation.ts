import { body } from "express-validator";

export const createMessage = [
  body("content")
    .notEmpty()
    .withMessage("content is required")
    .isString()
    .withMessage("content must be a string"),
  body("groupId")
    .notEmpty()
    .withMessage("groupId is required")
    .isString()
    .withMessage("groupId must be a string"),
];

export const getAllMessages = [
  body("groupId")
    .notEmpty()
    .withMessage("groupId is required")
    .isString()
    .withMessage("groupId must be a string"),
];
