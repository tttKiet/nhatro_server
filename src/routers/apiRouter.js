import express from "express";
import { ApiController } from "../app/Controllers";

const router = express.Router();

router.get("/users/all", ApiController.getAllUsers);
router.post("/users/create", ApiController.handleCreateUser);
router.get("/rooms", ApiController.rooms);

export default router;
