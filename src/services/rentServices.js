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
      const rentDocExitst = await Room.find({
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

export default { createRent, getRent, deleteRent };
