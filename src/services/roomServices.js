import { User, BoardHouse, Room } from "../app/Models";
import { getBoardHouseById } from "./boardHouseServices";
var ObjectId = require("mongoose").Types.ObjectId;

const createRoom = (
  id,
  number,
  size,
  isLayout,
  price,
  description,
  files,
  options
) => {
  return new Promise(async (resolve, reject) => {
    try {
      const isValidBoardHouse = ObjectId.isValid(id);
      if (!isValidBoardHouse) {
        return resolve({
          err: 1,
          message: "Id not valid!",
        });
      }

      const paths = files.map((f) => f.path);

      let convertIsLayout = false;
      if (isLayout === "Yes") {
        convertIsLayout = true;
      }

      const roomDoc = await Room.create({
        number: number,
        size: size,
        isLayout: convertIsLayout,
        price: price,
        description: description,
        images: paths,
        boardHouseId: id,
        options: options,
      });
      const populatedRoomDoc = await Room.findById(roomDoc._id).populate(
        "boardHouseId"
      );

      if (populatedRoomDoc) {
        resolve({
          err: 0,
          message: "Create room successfully",
        });
      }

      resolve({
        err: 1,
        message: `Something went wrong at createRoom!!`,
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
          message: `${roomId} not valid`,
        });
      }

      // purpose use findOneAndDelete is get data boardHouse was deleted
      const roomDoc = await Room.findOneAndDelete({
        _id: roomId,
      });
      if (roomDoc) {
        return resolve({
          err: 0,
          message: `${roomId} was deleted`,
          data: roomDoc,
        });
      }

      return resolve({
        err: 2,
        message: "Something went wrong at deleteRoomById",
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

      if (!isValidId) {
        return resolve({
          err: 1,
          message: "Id not valid",
        });
      }

      const {
        number,
        size,
        isLayout,
        price,
        description,
        arrImgToDelete,
        files,
        options,
      } = roomData;

      let convertIsLayout = false;
      if (isLayout === "Yes") {
        convertIsLayout = true;
      }

      const paths = files.map((f) => f.path);

      const roomDoc = await Room.findById(id);

      let imageToUpdate = roomDoc.images;

      if (arrImgToDelete.length > 0) {
        imageToUpdate = roomDoc.images.filter(
          (img) => !arrImgToDelete.includes(img)
        );
      }

      // const imageToUpdate = roomDoc.images.filter(
      //   (img) => !arrImgToDelete.includes(img)
      // );

      const combinedImgs = imageToUpdate.concat(paths);

      const roomDocUpdate = await Room.findOneAndUpdate(
        { _id: id },
        {
          number: number,
          size: size,
          isLayout: convertIsLayout,
          price: price,
          description: description,
          images: combinedImgs,
          options: options,
        }
      );

      if (roomDocUpdate) {
        return resolve({
          err: 0,
          message: "Update room successfully",
        });
      }

      return resolve({
        err: 2,
        message: "Something went wrong at updateRoom!",
      });
    } catch (error) {
      reject(error);
    }
  });
};

export default { createRoom, getAllRoomsByAdminId, deleteRoomById, updateRoom };
