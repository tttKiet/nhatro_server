import { User, BoardHouse, Room } from "../app/Models";

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

      if (roomDoc) {
        resolve({
          err: 0,
          message: "Đã tạo phòng thành công!",
        });
      }

      resolve({
        err: 1,
        message: `Đã có lỗi xảy ra !!`,
      });
    } catch (err) {
      reject(err);
    }
  });
};

export default { createRoom };
