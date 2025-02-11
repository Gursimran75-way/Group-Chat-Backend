import { Router } from "express";
import { catchError } from "../common/middleware/catch-validation-error.middleware";
import * as messageController from "./message.controller";
import * as messageValidator from "./message.validation";
import passport from "passport";
const authenticateJWT = passport.authenticate("jwt", { session: false });

const router = Router();

router.post(
  "/send",
  messageValidator.createMessage,
  catchError,
  authenticateJWT,
  messageController.createMessage
)
.post(
    "/get-all",
    messageValidator.getAllMessages,
    catchError,
    authenticateJWT,
    messageController.getAllMessages
)
export default router;
