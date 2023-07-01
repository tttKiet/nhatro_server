import express from "express";
import { ApiController } from "../app/Controllers";
import { cloundinary } from "../middleWares";
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

//create a feedback  Than
router.post("/user/feedback/create/:_id", ApiController.handleCreateFeedback);

//update a feedback  Than
router.patch("/user/feedback/update/:_id", ApiController.handleUpdateFeedback);

//delete a feedback Than
router.delete("/user/feedback/delete/:_id", ApiController.handleDeleteFeedback);

//read feedback Than

router.get("/user/feedback/read/:_id", ApiController.getAllFeedbacksById);

// /api/v1 [board-house]
router.post("/board-house/create", ApiController.handleCreateBoardHouse);
router.get("/board-house", ApiController.handleGetBoardHouse);
router.patch(
  "/board-house/update/:id",
  cloundinary.array("images"),
  ApiController.handleUpdateBoardHouse
);
router.delete("/board-house/delete/:id", ApiController.handleDeleteBoardHouse);

// /api/v1 [room] [The Van]
router.post(
  "/board-house/room/create/:id",
  cloundinary.array("images"),
  ApiController.handleCreateRoom
);
router.get("/board-house/room", ApiController.handleGetAllRooms);
router.delete("/board-house/room/delete/:id", ApiController.handleDeleteRoom);
router.patch(
  "/board-house/room/update/:id",
  cloundinary.array("images"),
  ApiController.handleUpdateRoom
);

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

// up post
router.post(
  "/user/:_id/up-post",
  cloundinary.array("images"),
  ApiController.handleUpPost
);

// [upload images cloudinary] [The Van]
// Upload a image
router.post("/upload-image", ApiController.handleUploadImage);

// Upload images
router.post("/upload-images", ApiController.handleUploadImages);

// Delete image
router.delete("/delete-image", ApiController.handleDeleteImage);

// Delete images
router.delete("/delete-images", ApiController.handleDeleteImages);

// Create request room owner [The Van]
// create request
router.post(
  "/user/create-req-board-house",
  ApiController.handleCreateReqBoardHouse
);

// get request
router.get(
  "/root/all-request-board-house/:id",
  ApiController.handleGetAllRequest
);

// get request of user
router.get(
  "/user/:_id/all-request-board-house",
  ApiController.handleGetAllRequestUser
);

// accept request
router.patch("/root/accept-req/:id", ApiController.handleAcceptReq);

// reject request
router.delete("/root/reject-req/:id", ApiController.handleRejectReq);

export default router;
