import { Router } from "express";
import { catchError } from "../common/middleware/catch-validation-error.middleware";
import * as messageController from "./message.controller";
import * as messageValidator from "./message.validation";
import passport from "passport";
const authenticateJWT = passport.authenticate("jwt", { session: false });

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: Message management endpoints
 */

/**
 * @swagger
 * /message/send:
 *   post:
 *     summary: Send a message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               groupId:
 *                 type: string
 *                 example: "groupId"
 *               content:
 *                 type: string
 *                 example: "Hello, how are you?"
 *     responses:
 *       200:
 *         description: Message sent successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/send",
  messageValidator.createMessage,
  catchError,
  authenticateJWT,
  messageController.createMessage
);
/**
 * @swagger
 * /message/get-all:
 *   post:
 *     summary: Get all messages
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               groupId:
 *                 type: string
 *                 example: "conv123"
 *     responses:
 *       200:
 *         description: List of messages
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/get-all",
  messageValidator.getAllMessages,
  catchError,
  authenticateJWT,
  messageController.getAllMessages
);
export default router;
