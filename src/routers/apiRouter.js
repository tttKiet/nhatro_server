import express from "express";
import { ApiController } from "../app/Controllers";

const router = express.Router();

router.get("/users", ApiController.users);
router.get("/rooms", ApiController.rooms);

export default router;
