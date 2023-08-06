import express from "express";
import { ApiController } from "../app/Controllers";
import { cloundinary } from "../middleWares";

const router = express.Router();

// /api/v1

// get all user
router.get("/users/all-users", ApiController.getAllUsers);

// delete one user have _id
router.delete("/user/delete/:_id", ApiController.handleDeleteUser);

// edit information user
router.get("/user/:id/room/rent", ApiController.handleGetRentRoomUser);

// get user by _id
router.get("/user", ApiController.getUserById);

// change user password
router.patch("/user/change-password", ApiController.handleChangePassword);

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

// user upload avatar
router.patch(
  "/user/change-avatar",
  cloundinary.array("images"),
  ApiController.handleChangeAvatar
);

// test
router.get("/rooms", ApiController.rooms);

// create rent
router.post("/room/:id/rent", ApiController.handleRentRoom);

// Accept rent request
router.patch("/rent/:_id/accept", ApiController.handleAcceptRentReq);

// Accept rent request
router.patch("/rent/:_id/reject", ApiController.handleRejectRentReq);

// delete rent room
router.delete("/rent/:id", ApiController.handleDeleteRentRoom);

// get rent
router.get("/room/all-rent", ApiController.handleGetRentRoom);

// Get rents from board house
router.get("/board-house/all-rent/:_id", ApiController.handleGetAllrentsFromBh);

//create a feedback
router.post("/user/feedback/create/:_id", ApiController.handleCreateFeedback);

//update a feedback
router.patch("/user/feedback/update/:_id", ApiController.handleUpdateFeedback);

//delete a feedback
router.delete("/user/:_id/delete-feedback", ApiController.handleDeleteFeedback);

//get feedback

router.get("/user/:_id/all-feedbacks", ApiController.getAllFeedbacksById);

// Check already user's feedback for board house
router.get(
  "/board-house/:_id/user-feedback",
  ApiController.handleCheckAlreadyFeedback
);

// update user's feedback for board house
router.patch(
  "/user/feedback-boardhouse/update",
  ApiController.handleUpdateFeedbackOfBoardHouse
);

// delete user's feedback for board house
router.delete(
  "/user/feedback-boardhouse/delete",
  ApiController.handleDeleteFeedbackOfBoardHouse
);

// /api/v1 [board-house]
router.get("/board-house/all-rooms", ApiController.handleGetAllRooms);
router.get("/board-house/page/:number", ApiController.handleGetBoardHouseAll);
router.post("/board-house/create", ApiController.handleCreateBoardHouse);
router.get("/board-house/:id", ApiController.handleGetBoardHouseById);
router.get("/board-house", ApiController.handleGetBoardHouse);
router.patch(
  "/board-house/update/:id",
  cloundinary.array("images"),
  ApiController.handleUpdateBoardHouse
);
router.delete("/board-house/delete/:id", ApiController.handleDeleteBoardHouse);
router.get(
  "/board-house/:_id/rating-price",
  ApiController.handleGetRatingAndPriceBh
);

// /api/v1/boardHouse/:_id/create?user= [The Van]
router.post(
  "/boardHouse/:_id/create-feedback",
  ApiController.handleCreateFeedbackOfBoardHouse
);

// get all user's feedback of board house [The Van]
router.get(
  "/boardHouse/:_id/all-feedbacks",
  ApiController.handleGetAllFeedbackOfBoardHouse
);

// /api/v1 [room] [The Van]
router.post(
  "/board-house/room/create/:id",
  cloundinary.array("images"),
  ApiController.handleCreateRoom
);

router.post("/board-house/room/delete/:id", ApiController.handleDeleteRoom);
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

// code miss pasword
router.post(
  "/user/miss-password/send-code",
  ApiController.handleSendCodeMissPassword
);

// verify code miss pasword
router.post(
  "/user/miss-password/verify-code",
  ApiController.handleVerifyCodeAndChangePassword
);

// up post
router.post(
  "/user/:_id/up-post",
  cloundinary.array("images"),
  ApiController.handleUpPost
);

// update post
router.patch(
  "/user/:_id/edit-post",
  cloundinary.array("images"),
  ApiController.handleEditPost
);

// get delete post by id
router.delete("/post/:_id", ApiController.handleDeletePostById);

// get all posts
router.get("/posts", ApiController.handleGetPost);

// get post by id
router.get("/post/:_id", ApiController.handleGetPostById);

// get comment post
router.get("/post/:id/comment", ApiController.handleGetComment);

// get all posts of user
router.get("/users/:_id/posts", ApiController.handleUserGetPost);

// like post
router.post("/post/:id/like", ApiController.handleToggleLikePost);

// get like post
router.get("/post/:id/like", ApiController.handleGetLikePost);

// comment
router.post("/comment", ApiController.handleComment);
router.patch("/comment/:id", ApiController.handleEditComment);
router.delete("/comment/:id", ApiController.handleDeleteComment);
router.get("/comment/:id/child", ApiController.handleGetChildComment);
router.get("/comment/limit", ApiController.handleGetLimitComment);

// Create request room owner [The Van]
// create request
router.post(
  "/user/:_id/create-req-board-house",
  cloundinary.array("images"),
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

// Favourite post [The Van]
// add
router.post(
  "/user/:_id/add-favourite-post",
  ApiController.handleAddFavouritePost
);

// get
router.get("/user/:_id/favourite-post", ApiController.handleGetFavouritePost);

// remove
router.delete(
  "/user/:_id/remove-favourite-post",
  ApiController.handleRemoveFavouritePost
);

export default router;
