import express from "express";
import { HomeController } from "../app/Controllers";

const router = express.Router();

router.get("/about", HomeController.about);
router.get("/", HomeController.index);

export default router;
