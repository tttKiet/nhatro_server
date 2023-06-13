import { User } from "../app/Models";
import { BoardHouse } from "../app/Models";

var ObjectId = require("mongoose").Types.ObjectId;

const createBoardHouse = ({ adminId }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const isValidAdmin = ObjectId.isValid(adminId);

      if (!isValidAdmin) {
        return resolve({
          err: 1,
          message: "Id không đúng định dạng!",
        });
      }

      const admin = await User.findById(adminId);

      if (!admin) {
        return resolve({
          err: 4,
          message: "Không tìm thấy admin",
        });
      }

      const boardHouseDoc = await BoardHouse.create({
        userId: adminId,
      });

      const populatedBoardHouseDoc = await BoardHouse.findById(
        boardHouseDoc._id
      ).populate("userId");

      if (populatedBoardHouseDoc) {
        return resolve({
          err: 0,
          message: "Create board house successfully",
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

const createBoardHouseFromReq = ({
  userId,
  name,
  address,
  phone,
  electricPrice,
  waterPrice,
  images,
}) => {
  return new Promise(async (resolve, reject) => {
    try {
      const isValidAdmin = ObjectId.isValid(userId);

      if (!isValidAdmin) {
        return resolve({
          err: 1,
          message: "Id not valid",
        });
      }

      const boardHouseDoc = await BoardHouse.create({
        userId: userId,
        name,
        address,
        phone,
        electricPrice,
        waterPrice,
        images,
      });

      const populatedBoardHouseDoc = await BoardHouse.findById(
        boardHouseDoc._id
      ).populate("userId");

      if (populatedBoardHouseDoc) {
        return resolve({
          err: 0,
          message: "Create board house successfully",
          boardHouseId: populatedBoardHouseDoc._id,
        });
      }

      return resolve({
        err: 3,
        message: "Wrong at createBoardHouseFromReq",
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
      const isValidBoardHouse = ObjectId.isValid(boardHouseId);
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

const deleteBoardHouse = (adminId, rootId, boardHouseId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const isValidAdmin = ObjectId.isValid(adminId);
      const isValidRoot = ObjectId.isValid(rootId);

      const isValidBoardHouse = ObjectId.isValid(boardHouseId);
      console.log(boardHouseId);
      if (!isValidAdmin || !isValidBoardHouse || !isValidRoot) {
        console.log(isValidBoardHouse);
        return resolve({
          err: 1,
          message: "Id không đúng định dạng",
        });
      }

      const adminDoc = await User.findById(adminId);

      if (!adminDoc || adminDoc.type !== "admin") {
        return resolve({
          err: 2,
          message: `${adminId}: Không phải là admin`,
        });
      }

      const rootDoc = await User.findById(rootId);

      if (!rootDoc || rootDoc.type !== "root") {
        return resolve({
          err: 3,
          message: `${rootId}: Không phải là root`,
        });
      }

      // purpose use findOneAndDelete is get data boardHouse was deleted
      const boardHouse = await BoardHouse.findOneAndDelete({
        _id: boardHouseId,
        userId: adminId,
      });
      if (boardHouse) {
        return resolve({
          err: 0,
          message: `${boardHouseId} đã được xoá thành công`,
          data: boardHouse,
        });
      }

      return resolve({
        err: 4,
        message: "Không tìm thấy dãy trọ",
      });
    } catch (error) {
      reject(error);
    }
  });
};

const getBoardHouseById = (adminId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const isValid = ObjectId.isValid(adminId);
      if (!isValid) {
        return resolve({
          err: 1,
          message: `${adminId} là id không hợp lệ`,
        });
      }

      const adminDoc = await User.findById(adminId);

      if (!adminDoc || adminDoc.type !== "admin") {
        return resolve({
          err: 2,
          message: `${adminId} không phải là admin`,
        });
      }

      const boardHouseDoc = await BoardHouse.find({ userId: adminId });
      if (boardHouseDoc) {
        return resolve({
          err: 0,
          message: "Lấy dữ liệu thành công",
          data: boardHouseDoc,
        });
      } else {
        return resolve({
          err: 3,
          message: `${adminId} không sở hữu dãy trọ nào`,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

export default {
  createBoardHouse,
  updateBoardHouse,
  deleteBoardHouse,
  getBoardHouseById,
  createBoardHouseFromReq,
};
