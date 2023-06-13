import { ReqRoomOwner, User } from "../app/Models";

var ObjectId = require("mongoose").Types.ObjectId;

const createReqRoomOwner = (userId, boardHouseId, description) => {
  return new Promise(async (resolve, reject) => {
    try {
      const isValidUser = ObjectId.isValid(userId);
      if (!isValidUser) {
        return resolve({
          err: 1,
          message: "Id not valid",
        });
      }

      const userDoc = await User.findById(userId);
      if (!userDoc) {
        return resolve({
          err: 2,
          message: "Couldn't find user",
        });
      }

      if (!userDoc.emailVerified) {
        return resolve({
          err: 3,
          message: "You need verification email to submit request",
        });
      }

      const reqDoc = await ReqRoomOwner.create({
        userId: userId,
        boardHouseId: boardHouseId,
        description: description,
      });

      const populatedReqDoc = await ReqRoomOwner.findById(reqDoc._id)
        .populate("userId")
        .populate("boardHouseId");

      if (populatedReqDoc) {
        console.log(populatedReqDoc);
        return resolve({
          err: 0,
          message: "Create req successfully",
        });
      }

      return resolve({
        err: 4,
        message: "Something went wrong",
      });
    } catch (err) {
      reject(err);
    }
  });
};

const getAllReq = (rootId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const rootDoc = await User.findById(rootId);

      if (rootDoc.type !== "root") {
        return resolve({
          err: 1,
          message: "You don't have root's permission",
        });
      }

      const reqsDoc = await ReqRoomOwner.find()
        .populate("userId")
        .populate("boardHouseId");

      if (reqsDoc) {
        return resolve({
          err: 0,
          message: "Get all request successfully",
          data: reqsDoc,
        });
      }

      return resolve({
        err: 2,
        message: "Something went wrong at getAllReq",
      });
    } catch (error) {
      reject(error);
    }
  });
};

export default { createReqRoomOwner, getAllReq };
