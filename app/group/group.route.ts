import { Router } from "express";
import { catchError } from "../common/middleware/catch-validation-error.middleware";
import * as groupController from "./group.controller";
import * as groupValidator from "./group.validation";
import passport from "passport";
import { roleAuth } from "../common/middleware/role-auth.middleware";

const router = Router();
const authenticateJWT = passport.authenticate("jwt", { session: false });
// const publicRoutes = ["/login", "/create-user"];

/**
 * @swagger
 * tags:
 *   name: Groups
 *   description: Group management endpoints
 */

/**
 * @swagger
 * /group/public:
 *   get:
 *     summary: Get public groups
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved public groups
 */
router.get("/public", authenticateJWT, groupController.getPublicGroups);
/**
 * @swagger
 * /group:
 *   post:
 *     summary: Create a new group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Developers Club"
 *               type:
 *                 type: string
 *                 example: "public or private"
 *     responses:
 *       201:
 *         description: Group successfully created
 */
router.post(
  "/",
  groupValidator.createGroup,
  catchError,
  authenticateJWT,
  groupController.createGroup
);
/**
 * @swagger
 * /group/{groupId}/join:
 *   post:
 *     summary: Join a public group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the group to join
 *     responses:
 *       200:
 *         description: Successfully joined the group
 */
router.post(
  "/:groupId/join",
  groupValidator.joinPublicGroup,
  catchError,
  authenticateJWT,
  groupController.joinPublicGroup
);
/**
 * @swagger
 * /group/{groupId}/invite/{userId}:
 *   post:
 *     summary: Invite a user to a group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the group
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to invite
 *     responses:
 *       200:
 *         description: Invitation sent successfully
 */
router.post(
  "/:groupId/invite/:userId",
  groupValidator.createInvitation,
  catchError,
  authenticateJWT,
  groupController.createInvitation
);
/**
 * @swagger
 * /group/accept-invitation/{token}:
 *   post:
 *     summary: Accept a group invitation
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Invitation token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "example@gmail.com"
 *               password:
 *                 type: string
 *                 example: "123"
 *     responses:
 *       200:
 *         description: Invitation accepted successfully
 */

router.post(
  "/accept-invitation/:token",
  groupValidator.acceptInvitation,
  catchError,
  passport.authenticate("login", { session: false }),
  groupController.acceptInvitation
);
/**
 * @swagger
 * /group/analytics:
 *   get:
 *     summary: Get overall analytics
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved analytics
 */
router.get("/analytics", authenticateJWT, groupController.analytics);
/**
 * @swagger
 * /group/group-analytics/{groupId}:
 *   get:
 *     summary: Get analytics for a specific group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the group
 *     responses:
 *       200:
 *         description: Successfully retrieved group analytics
 */
router.get(
  "/group-analytics/:groupId",
  groupValidator.groupAnalytics,
  catchError,
  authenticateJWT,
  groupController.groupAnalytics
);
/**
 * @swagger
 * /group/edit-group/{groupId}:
 *   put:
 *     summary: Edit a group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the group to edit
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated Group Name"
 *     responses:
 *       200:
 *         description: Group updated successfully
 */
router.put(
  "/edit-group/:groupId",
  groupValidator.editGroup,
  catchError,
  authenticateJWT,
  groupController.editGroup
);
/**
 * @swagger
 * /group/delete/{groupId}:
 *   delete:
 *     summary: Delete a group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the group to delete
 *     responses:
 *       200:
 *         description: Group deleted successfully
 */
router.delete("/delete/:groupId", authenticateJWT, groupController.deleteGroup);

export default router;
