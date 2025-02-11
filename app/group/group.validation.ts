import { body, param } from "express-validator";

export const createGroup = [
  body("name")
    .notEmpty()
    .withMessage("name is required")
    .isString()
    .withMessage("name must be a string"),
  body("type")
    .notEmpty()
    .withMessage("type is required")
    .isString()
    .withMessage("type must be a string"),
];

export const joinPublicGroup = [
  param("groupId")
    .notEmpty()
    .withMessage("ID is required")
    .isString()
    .withMessage("ID must be a string"),
];

export const createInvitation = [
  param("groupId")
    .notEmpty()
    .withMessage("ID is required")
    .isString()
    .withMessage("ID must be a string"),
  param("userId")
    .notEmpty()
    .withMessage("ID is required")
    .isString()
    .withMessage("ID must be a string"),
];

export const acceptInvitation = [
  body("email")
    .notEmpty()
    .withMessage("email is required")
    .isString()
    .withMessage("email must be a string"),
  body("password")
    .notEmpty()
    .withMessage("password is required")
    .isString()
    .withMessage("password must be a string"),
  param("token")
    .notEmpty()
    .withMessage("token is required")
    .isString()
    .withMessage("token must be a string"),
];

export const groupAnalytics = [
  param("groupId")
    .notEmpty()
    .withMessage("groupId is required")
    .isString()
    .withMessage("groupId must be a string"),
];

export const editGroup = [
  param("groupId")
    .notEmpty()
    .withMessage("groupId is required")
    .isString()
    .withMessage("groupId must be a string"),
    body("name")
    .notEmpty()
    .withMessage("name is required")
    .isString()
    .withMessage("name must be a string"),
];
