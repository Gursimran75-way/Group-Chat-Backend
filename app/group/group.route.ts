import { Router } from "express";
import { catchError } from "../common/middleware/catch-validation-error.middleware";
import * as groupController from "./group.controller";
import * as groupValidator from "./group.validation";
import passport from "passport";
import { roleAuth } from "../common/middleware/role-auth.middleware";

const router = Router();
const authenticateJWT = passport.authenticate("jwt", { session: false });
// const publicRoutes = ["/login", "/create-user"];

router
  .get(
    "/public",
    authenticateJWT,
    groupController.getPublicGroups
  )
  .post(
    "/",
    groupValidator.createGroup,
    catchError,
    authenticateJWT,
    groupController.createGroup
  )
  .post(
    "/:groupId/join",
    groupValidator.joinPublicGroup,
    catchError,
    authenticateJWT,
    groupController.joinPublicGroup
  )
  .post(
    "/:groupId/invite/:userId",
    groupValidator.createInvitation,
    catchError,
    authenticateJWT,
    groupController.createInvitation
  )
  .post(
    "/accept-invitation/:token",
    groupValidator.acceptInvitation,
    catchError,
    passport.authenticate("login", { session: false }),
    groupController.acceptInvitation
  )
  .get(
    "/analytics",
    authenticateJWT,
    groupController.analytics
  )
  .get(
    "/group-analytics/:groupId",
    groupValidator.groupAnalytics,
    catchError,
    authenticateJWT,
    groupController.groupAnalytics
  )
  .put(
    "/edit-group/:groupId",
    groupValidator.editGroup,
    catchError,
    authenticateJWT,
    groupController.editGroup
  )
  .delete(
    "/delete/:groupId",
    authenticateJWT,
    groupController.deleteGroup
  )

export default router;
