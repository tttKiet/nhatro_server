import { User, BoardHouse, Room } from "../app/Models";
import { getBoardHouseById } from "./boardHouseServices";
var ObjectId = require("mongoose").Types.ObjectId;

const createRoom = (id, roomData) => {
  return new Promise(async (resolve, reject) => {
    try {
      const isValidBoardHouse = ObjectId.isValid(id);
      if (!isValidBoardHouse) {
        return resolve({
          err: 1,
          message: "Id không đúng định dạng!",
        });
      }

      const { size, isLayout, price, description, images } = roomData;
      console.log("is layout: ", isLayout);
      let convertIsLayout = false;
      if (isLayout === "Yes") {
        convertIsLayout = true;
      }

      const roomDoc = await Room.create({
        size,
        isLayout: convertIsLayout,
        price,
        description,
        images,
        boardHouseId: id,
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
          //   console.log("receiveData", receiveData);

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

const deleteRoomById = (roomId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const isRoomId = ObjectId.isValid(roomId);

      if (!isRoomId) {
        return resolve({
          err: 1,
          message: `${roomId} khong hop le`,
        });
      }

      // purpose use findOneAndDelete is get data boardHouse was deleted
      const roomDoc = await Room.findOneAndDelete({
        _id: roomId,
      });
      if (roomDoc) {
        return resolve({
          err: 0,
          message: `${roomId} đã được xoá thành công`,
          data: roomDoc,
        });
      }

      return resolve({
        err: 2,
        message: "Có lỗi xảy ra deleteRoomById",
      });
    } catch (error) {
      reject(error);
    }
  });
};

const updateRoom = (id, roomData) => {
  return new Promise(async (resolve, reject) => {
    try {
      const isValidId = ObjectId.isValid(id);

      if (!isValidAdmin || !isValidBoardHouse) {
        return resolve({
          err: 1,
          message: "Id không đúng định dạng",
        });
      }

      const adminDoc = await User.findById(adminId);

      if (!adminDoc || adminDoc.type !== "admin") {
        return resolve({
          err: 2,
          message: `${adminId}: Bạn không phải là admin`,
        });
      }

      const boardHouseDoc = await BoardHouse.findOneAndUpdate(
        { _id: boardHouseId, userId: adminId },
        { name, address, phone, electricPrice, waterPrice, images }
      );

      if (boardHouseDoc) {
        return resolve({
          err: 0,
          message: "Cập nhật dãy trọ thành công",
        });
      }

      return resolve({
        err: 3,
        message: "Không tìm thấy dãy trọ mà bạn muốn cập nhật",
      });
    } catch (error) {
      reject(error);
    }
  });
};

export default { createRoom, getAllRoomsByAdminId, deleteRoomById };
