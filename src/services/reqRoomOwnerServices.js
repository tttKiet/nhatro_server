import { BoardHouse, ReqRoomOwner, User } from "../app/Models";

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
          data: populatedReqDoc,
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

const getReqOwnerByUserId = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const isValid = ObjectId.isValid(userId);
      if (!isValid) {
        return resolve({
          err: 1,
          message: `${_id} User invalid!`,
        });
      }

      // Get all req of user
      const reqOwnerDoc = await ReqRoomOwner.find({ userId }).populate(
        "boardHouseId"
      );

      if (reqOwnerDoc) {
        return resolve({
          err: 0,
          message: `Success!`,
          data: reqOwnerDoc,
        });
      } else {
        return resolve({
          err: 2,
          message: `Not found!`,
          data: reqOwnerDoc,
        });
      }
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });
};

const acceptReq = (reqId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const isValid = ObjectId.isValid(reqId);
      if (!isValid) {
        return resolve({
          err: 1,
          message: "Id not valid",
        });
      }

      const reqDoc = await ReqRoomOwner.findByIdAndUpdate(reqId, { status: 1 });
      if (reqDoc) {
        // Send notification to user here

        return resolve({
          err: 0,
          message: "Accepted request",
        });
      }
      return resolve({
        err: 2,
        message: "Something went wrong at acceptReq",
      });
    } catch (error) {
      resolve(error);
    }
  });
};

const rejectReq = (reqId, boardHouseId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const isValid = ObjectId.isValid(reqId);
      if (!isValid) {
        return resolve({
          err: 1,
          message: "Id not valid",
        });
      }

      const boardHouseDoc = await BoardHouse.findOneAndDelete({
        _id: boardHouseId,
      });
      // console.log(boardHouseDoc);
      if (boardHouseDoc) {
        // Send notification to user here
        const reqDoc = await ReqRoomOwner.findByIdAndDelete(reqId);
        if (reqDoc) {
          return resolve({
            err: 0,
            message: "Deleted request",
          });
        }
      }

      return resolve({
        err: 2,
        message: "Something went wrong at rejectReq",
      });
    } catch (error) {
      resolve(error);
    }
  });
};

export default {
  createReqRoomOwner,
  getAllReq,
  getReqOwnerByUserId,
  acceptReq,
  rejectReq,
};
