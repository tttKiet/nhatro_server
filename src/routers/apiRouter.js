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

// edit information user
router.patch("/user", ApiController.handleUpdateUser);

// authn login
router.post("/user/login", ApiController.handleLogin);

// create new user  
router.post("/users/create", ApiController.handleCreateUser);

// permissions account
router.get("/permissions/user/:_id", ApiController.handlePermissionsUser);

// test
router.get("/rooms", ApiController.rooms);

//create a feedback  Than
router.post("/user/feedback/create/:_id",ApiController.handleCreateFeedback);

//update a feedback  Than
router.patch("/user/feedback/update/:_id",ApiController.handleUpdateFeedback);

//delete a feedback Than
router.delete("/user/feedback/delete/:_id", ApiController.handleDeleteFeedback);

export default router;
