import { User, Account, Rent, Room } from "../app/Models";
import moment from "moment";
import * as dotenv from "dotenv";
var ObjectId = require("mongoose").Types.ObjectId;
dotenv.config();

const createRent = async ({ roomId, userId, startDate }) => {
  return new Promise(async (resolve, reject) => {
    try {
      Promise.all([Room.findById(roomId), User.findById(userId)])
        .then(([r, u]) => {
          if (!r || !u) {
            return resolve({
              err: 1,
              message: `Not found user ${userId} or room ${roomId}`,
            });
          }
        })
        .catch((err) => {
          return resolve({
            err: 2,
            message: `${err?.message}`,
          });
        });

      // Check free time
      const rentDocExitst = await Rent.find({
        userId: userId,
        status: 1,
        roomId,
        $or: [{ endDate: null }, { endDate: { $gt: new Date() } }],
      });

      if (rentDocExitst.length > 0) {
        return resolve({
          err: 3,
          message: "You have rented this room!",
        });
      }

      const isRent = await isRentRoom(roomId);
      if (isRent) {
        return resolve({
          err: 4,
          message: "This room was rented. Thanks for visiting!",
        });
      }

      // Check your request: test: "2023-7-28"
      var today = new Date();
      var thirtyDaysAgo = new Date(new Date().setDate(today.getDate() - 30));

      const rentDocExitstReq = await Rent.findOne({
        user: userId,
        status: 0,
        room: roomId,
        startDate: { $gt: thirtyDaysAgo },
      })
        .sort({ createdAt: "-1" })
        .lean();

      if (rentDocExitstReq) {
        return resolve({
          err: 5,
          message: `You have request to rent this room on ${moment(
            rentDocExitstReq.startDate
          ).format("L")}. Resend request on ${moment(
            new Date(rentDocExitstReq.startDate).setDate(
              new Date(rentDocExitstReq.startDate).getDate() + 30
            )
          ).format("L")} !`,
        });
      }

      const rentDoc = await Rent.create({
        user: userId,
        room: roomId,
        startDate,
      });
      if (!rentDoc) {
        return resolve({ err: 1, message: "Rent is created" });
      }
      return resolve({ err: 0, message: "Rent", data: rentDoc });
    } catch (err) {
      reject(err);
    }
  });
};

const isRentRoom = async (roomId) => {
  const rentDocExitst = await Rent.findOne({
    status: 1,
    room: roomId,
    $or: [{ endDate: null }, { endDate: { $gt: new Date() } }],
  });

  return rentDocExitst;
};

const getRent = async ({ userId }) => {
  return new Promise(async (resolve, reject) => {
    const idValid = ObjectId.isValid(userId);
    if (!idValid) {
      return resolve({ err: 1, message: "Id user invalid!" });
    }
    try {
      const rentDoc = await Rent.find({
        user: userId,
      })
        .populate({
          path: "room",
          populate: {
            path: "boardHouseId",
            populate: {
              path: "userId",
              select: "fullName phone email emailVerified",
            },
          },
        })
        .sort({ createdAt: -1 });
      if (!rentDoc) {
        return resolve({ err: 1, message: "Rent not found!" });
      }
      return resolve({ err: 0, message: "Ok", data: rentDoc });
    } catch (err) {
      reject(err);
    }
  });
};

const deleteRent = async ({ _id }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const idValid = ObjectId.isValid(_id);
      if (!idValid) {
        return resolve({ err: 1, message: `${_id} invalid!!!` });
      }

      const rentDoc = await Rent.deleteOne({ _id });
      if (!rentDoc || rentDoc.deletedCount == 0) {
        resolve({ err: 2, message: `${_id} is not deleted or deleted!!!` });
      }

      resolve({ err: 0, message: `${_id} Deleted!!!` });
    } catch (err) {
      reject(err);
    }
  });
};

const getAllRentsByBoardHouse = async (boardHouseId, status = 1) => {
  return new Promise(async (resolve, reject) => {
    try {
      let rentDocs = await Rent.find({
        status: status,
        $or: [{ endDate: null }, { endDate: { $gt: new Date() } }],
      })
        .populate({
          path: "room",
          select: "_id number price boardHouseId",
          populate: {
            path: "boardHouseId",
            select: "_id name electricPrice waterPrice",
          },
        })
        .populate({ path: "user", select: "fullName email phone" })
        .lean();
      rentDocs = rentDocs.filter(
        (v) => v.room.boardHouseId._id == boardHouseId
      );

      return resolve({
        err: 0,
        message: "Get successfully!",
        data: rentDocs,
      });
    } catch (err) {
      reject(err);
    }
  });
};

const acceptRentReq = async (rentId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const currentDate = new Date();
      const rentDoc = await Rent.findByIdAndUpdate(rentId, {
        status: "1",
        startDate: currentDate,
      });

      if (!rentDoc) {
        resolve({
          err: 1,
          message: "something wrong at acceptRentReq!",
        });
      }

      return resolve({
        err: 0,
        message: "Accept request success fully",
      });
    } catch (err) {
      reject(err);
    }
  });
};

const rejectRentReq = async (rentId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const rentDoc = await Rent.findByIdAndUpdate(rentId, {
        status: "-1",
      });

      if (!rentDoc) {
        resolve({
          err: 1,
          message: "something wrong at acceptRentReq!",
        });
      }

      return resolve({
        err: 0,
        message: "Reject request success fully",
      });
    } catch (e) {
      reject(e);
    }
  });
};

const getRoomRentByUser = async ({ userId }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const idValid = ObjectId.isValid(userId);
      if (!idValid) {
        return resolve({ err: 1, message: `${userId} invalid!!!` });
      }

      const rentDoc = await Rent.find({
        status: 1,
        user: userId,
        $or: [{ endDate: null }, { endDate: { $gt: new Date() } }],
      }).populate({
        path: "room",
        select: "number size price images isLayout",
        populate: {
          path: "boardHouseId",
          select:
            "name electricPrice waterPrice address phone electricPrice waterPrice",
          populate: {
            path: "userId",
            select: "fullName email emailVerified avatar phone",
          },
        },
      });

      resolve({ err: 0, message: `Ok`, data: rentDoc });
    } catch (err) {
      reject(err);
    }
  });
};

export default {
  rejectRentReq,
  acceptRentReq,
  createRent,
  getRent,
  deleteRent,
  getAllRentsByBoardHouse,
  getRoomRentByUser,
};
