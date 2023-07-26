import { User } from "../app/Models";
import { BoardHouse } from "../app/Models";
import roomServices from "./roomServices";

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
  _id,
  name,
  address,
  phone,
  electricPrice,
  waterPrice,
  files,
}) => {
  return new Promise(async (resolve, reject) => {
    try {
      const isValidAdmin = ObjectId.isValid(_id);

      if (!isValidAdmin) {
        return resolve({
          err: 1,
          message: "Id not valid",
        });
      }

      const paths = files.map((f) => f.path);

      const boardHouseDoc = await BoardHouse.create({
        userId: _id,
        name,
        address,
        phone,
        electricPrice,
        waterPrice,
        images: paths,
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
  id,
  { name, address, phone, electricPrice, waterPrice, arrImgToDelete, files }
) => {
  return new Promise(async (resolve, reject) => {
    try {
      const isValidBoardHouse = ObjectId.isValid(id);
      if (!isValidBoardHouse) {
        return resolve({
          err: 1,
          message: "Id not valid",
        });
      }

      const paths = files.map((f) => f.path);

      const boardHouseDoc = await BoardHouse.findById(id);

      let imageToUpdate = boardHouseDoc.images;

      if (arrImgToDelete.length > 0) {
        imageToUpdate = boardHouseDoc.images.filter(
          (img) => !arrImgToDelete.includes(img)
        );
      }

      const combinedImgs = imageToUpdate.concat(paths);

      const boardHouseDocUpdate = await BoardHouse.findOneAndUpdate(
        { _id: id },
        {
          name: name,
          address: address,
          phone: phone,
          electricPrice: electricPrice,
          waterPrice: waterPrice,
          images: combinedImgs,
        }
      );

      if (boardHouseDocUpdate) {
        return resolve({
          err: 0,
          message: "Update board house successfully",
        });
      }

      return resolve({
        err: 2,
        message: "Some thing went wrong at updateBoardHouse",
      });
    } catch (error) {
      console.log("err", error);
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

const getBoardHouseBy_Id = ({ id }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const isValid = ObjectId.isValid(id);
      if (!isValid) {
        return resolve({
          err: 1,
          message: `${id} invalid!!!`,
        });
      }

      const boardHouseDoc = await BoardHouse.findById(id)
        .populate(
          "userId",
          "_id fullName email emailVerified avatar phone address"
        )
        .lean();

      if (!boardHouseDoc) {
        return resolve({
          err: 2,
          message: `${id} not found!`,
        });
      }

      const rooms = await roomServices.getAllRoomsById(id);
      return resolve({
        err: 0,
        message: "Ok!",
        data: {
          ...boardHouseDoc,
          rooms: rooms,
        },
      });
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
};

const getBoardHouseAll = ({ number = 1 }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const pageSize = 30;
      const skip = (number - 1) * pageSize;
      const boardHouseDoc = await BoardHouse.find()
        .populate("userId", "fullName avatar _id phone")
        .sort({
          createdAt: "desc",
        })
        .skip(skip)
        .limit(pageSize)
        .lean();

      return resolve({
        err: 0,
        message: "Ok!",
        data: boardHouseDoc,
      });
    } catch (error) {
      console.log(error);
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
  getBoardHouseAll,
  getBoardHouseBy_Id,
};
