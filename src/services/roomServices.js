import { User, BoardHouse, Room } from "../app/Models";
import { getBoardHouseById } from "./boardHouseServices";
var ObjectId = require("mongoose").Types.ObjectId;

const createRoom = ({
  size,
  isLayout,
  price,
  description,
  images,
  boardHouseId,
}) => {
  return new Promise(async (resolve, reject) => {
    try {
      const isValidBoardHouse = ObjectId.isValid(boardHouseId);
      if (!isValidBoardHouse) {
        return resolve({
          err: 1,
          message: "Id không đúng định dạng!",
        });
      }

      const roomDoc = await Room.create({
        size,
        isLayout,
        price,
        description,
        images,
        boardHouseId,
      });
      const populatedRoomDoc = await Room.findById(roomDoc._id).populate(
        "boardHouseId"
      );

      if (populatedRoomDoc) {
        resolve({
          err: 0,
          message: "Đã tạo phòng thành công!",
        });
      }

      resolve({
        err: 1,
        message: `Đã có lỗi xảy ra createRoom!!`,
      });
    } catch (err) {
      reject(err);
    }
  });
};

const getAllRoomsById = async (boardHouseId) => {
  try {
    const roomsDoc = await Room.find({ boardHouseId: boardHouseId }).exec();
    return roomsDoc || [];
  } catch (error) {
    throw error;
  }
};

const getAllRoomsByAdminId = (adminId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const isValid = ObjectId.isValid(adminId);
      if (!isValid) {
        return resolve({
          err: 1,
          message: `${adminId} là id không hợp lệ`,
        });
      }

      const boardHouseDoc = await BoardHouse.find({ userId: adminId });
      if (!boardHouseDoc) {
        return resolve({
          err: 2,
          message: `Không có dãy trọ tương ứng với ${adminId}`,
        });
      }

      const receiveData = [];

      if (boardHouseDoc.length > 0) {
        try {
          const roomsDataPromises = boardHouseDoc.map(async (boardHouse) => {
            const data = await getAllRoomsById(boardHouse._id);
            // console.log("data", data);
            return {
              boardHouseId: boardHouse._id,
              rooms: data ? [...data] : [],
            };
          });

          //   Đợi cho tất cả các Promise trong roomsDataPromises hoàn thành.
          const data = await Promise.all(roomsDataPromises);
          receiveData.push(...data);
          console.log("receiveData", receiveData);

          return resolve({
            err: 0,
            data: receiveData,
            message: `Thanh cong`,
          });
        } catch (error) {
          console.error(error);
          return reject(error);
        }
      }

      return resolve({
        err: 3,
        message: `Có lỗi xảy ra getAllRoomsByAdminId`,
      });
    } catch (error) {
      reject(error);
    }
  });
};

export default { createRoom, getAllRoomsByAdminId };
