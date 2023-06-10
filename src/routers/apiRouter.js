import express from "express";
import { ApiController } from "../app/Controllers";

const router = express.Router();

// /api/v1

// get all user
router.get("/users/all-users", ApiController.getAllUsers);

// delete one user have _id
router.delete("/user/delete/:_id", ApiController.handleDeleteUser);

// get user by _id
router.get("/user", ApiController.getUserById);

// update info user
router.patch("/users/:_id", ApiController.handleUpdateInfoUser);

// get user getProfile
router.get("/profile", ApiController.getProfile);

// edit information user
router.patch("/user", ApiController.handleUpdateUser);

// login with social auth
router.post("/user/login/social", ApiController.handleLoginWithSocial);

// authn login
router.post("/user/login", ApiController.handleLogin);

// create new user
router.post("/users/create", ApiController.handleCreateUser);

// permissions account
router.get("/permissions/user/:_id", ApiController.handlePermissionsUser);

// loggout
router.get("/loggout", ApiController.handleLoggout);

// test
router.get("/rooms", ApiController.rooms);

// /api/v1 [board-house]
router.post("/board-house/create", ApiController.handleCreateBoardHouse);
router.get("/board-house", ApiController.handleGetBoardHouse);
router.patch("/board-house/update", ApiController.handleUpdateBoardHouse);
router.delete("/board-house/delete/:id", ApiController.handleDeleteBoardHouse);

// /api/v1 [room]
router.post("/board-house/room/create/:id", ApiController.handleCreateRoom);
router.get("/board-house/room", ApiController.handleGetAllRooms);
router.delete("/board-house/room/delete/:id", ApiController.handleDeleteRoom);
router.patch("/board-house/room/update/:id", ApiController.handleUpdateRoom);

// [code] verify - email
router.post("/user/verify/email/send-code", ApiController.handleSendCodeEmail);
router.post(
  "/user/verify/email/check-exist-code",
  ApiController.handleCheckExistCodeEmail
);
router.post(
  "/user/verify/email/verify-code",
  ApiController.handleVerifyCodeEmail
);

export default router;
