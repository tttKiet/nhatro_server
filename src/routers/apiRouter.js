import express from "express";
import { ApiController } from "../app/Controllers";

const router = express.Router();

// /api/v1
router.get("/users/all-users", ApiController.getAllUsers);
router.delete("/user/delete/:_id", ApiController.handleDeleteUser);
router.get("/user", ApiController.getUserById);
router.patch("/user", ApiController.handleUpdateUser);
router.post("/user/login", ApiController.handleLogin);
router.post("/users/create", ApiController.handleCreateUser);
router.get("/rooms", ApiController.rooms);

// /api/v1 [board-house]
router.post("/board-house/create", ApiController.handleCreateBoardHouse);
router.get("/board-house", ApiController.handleGetBoardHouse);
router.patch("/board-house/update", ApiController.handleUpdateBoardHouse);
router.delete("/board-house/delete/:id", ApiController.handleDeleteBoardHouse);

// /api/v1 [room]
router.post("/room/create", ApiController.handleCreateRoom);

export default router;
