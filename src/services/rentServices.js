import { User, Account, Rent, Room } from "../app/Models";
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

      const rentDoc = await Rent.create({
        user: userId,
        roomId: roomId,
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

export default { createRent };
