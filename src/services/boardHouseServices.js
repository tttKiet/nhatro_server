import { User } from "../app/Models";
import { BoardHouse } from "../app/Models";

var ObjectId = require("mongoose").Types.ObjectId;

const createBoardHouse = ({ adminId, rootId }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const isValidAdmin = ObjectId.isValid(adminId);
      const isValidRoot = ObjectId.isValid(rootId);

      if (!isValidAdmin || !isValidRoot) {
        return resolve({
          err: 1,
          message: "Id không đúng định dạng!",
        });
      }

      const admin = await User.findById(adminId);
      const root = await User.findById(rootId);

      if (!admin || !root) {
        return resolve({
          err: 4,
          message: "Không tìm thấy admin hoặc root",
        });
      }

      if (admin.type !== "admin" || root.type !== "root") {
        return resolve({
          err: 2,
          message: "Lỗi xảy ra vì bạn không có quyền tạo",
        });
      }

      const boardHouseDoc = await BoardHouse.create({
        userId: adminId,
      });

      if (boardHouseDoc) {
        return resolve({
          err: 0,
          message: "Tạo dãy trọ thành công",
        });
      }

      return resolve({
        err: 3,
        message: "Đã có lỗi xảy ra createBoardHouse",
      });
    } catch (error) {
      reject(error);
    }
  });
};

const updateBoardHouse = (
  adminId,
  boardHouseId,
  { name, address, phone, electricPrice, waterPrice, images }
) => {
  return new Promise(async (resolve, reject) => {
    try {
      const isValidAdmin = ObjectId.isValid(adminId);
      const isValidBoardHouse = ObjectId.isValid(adminId);
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

export default { createBoardHouse, updateBoardHouse };
