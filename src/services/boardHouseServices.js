import { FeedbackOfBoardHouse, Room, User } from "../app/Models";
import { BoardHouse } from "../app/Models";
import userServices from "./userServices";
import roomServices from "./roomServices";

var ObjectId = require("mongoose").Types.ObjectId;

const checkBoardHouseExisted = async (name, boardHouseId) => {
  try {
    const nameTrimed = name.trim();
    const res = await BoardHouse.findOne({
      name: nameTrimed,
    });
    if (res && res._id != boardHouseId) {
      return true;
    } else if (res && boardHouseId == undefined) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return "err";
  }
};

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
  options,
  addressFilter,
  description,
}) => {
  return new Promise(async (resolve, reject) => {
    try {
      const isBoardHouseExisted = await checkBoardHouseExisted(name);
      if (isBoardHouseExisted) {
        return resolve({
          err: 2,
          message: "This board house has been existed",
        });
      }

      const paths = files.map((f) => f.path);

      const boardHouseDoc = await BoardHouse.create({
        userId: _id,
        name,
        address,
        description,
        phone,
        electricPrice,
        waterPrice,
        images: paths,
        options: options.split(","),
        addressFilter: JSON.parse(addressFilter),
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
        err: 2,
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

      const isBoardHouseExisted = await checkBoardHouseExisted(name, id);
      if (isBoardHouseExisted) {
        return resolve({
          err: 3,
          message: "This board house has been existed",
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

      if (!isValidAdmin || !isValidBoardHouse || !isValidRoot) {
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
          message: `${adminId} is not valid`,
        });
      }

      const adminDoc = await User.findById(adminId);

      if (!adminDoc || adminDoc.type !== "admin") {
        return resolve({
          err: 2,
          message: `${adminId} is not admin`,
        });
      }

      const boardHouseDoc = await BoardHouse.find({
        userId: adminId,
        status: "1",
      });
      if (boardHouseDoc) {
        return resolve({
          err: 0,
          message: "Get board house success",
          data: boardHouseDoc,
        });
      } else {
        return resolve({
          err: 3,
          message: `Something wrong at getBoardHouseById`,
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

      const starAndPrice = await getRatingAndPrice(boardHouseDoc._id);

      return resolve({
        err: 0,
        message: "Ok!",
        data: {
          ...boardHouseDoc,
          rooms: rooms,
          starAndPrice: starAndPrice,
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
      const boardHouseDoc = await BoardHouse.find({ status: "1" })
        .populate("userId", "fullName avatar _id phone")
        .sort({
          createdAt: "desc",
        })
        .skip(skip)
        .limit(pageSize)
        .lean();

      let arr = [];

      if (boardHouseDoc.length > 0) {
        arr = await Promise.all(
          boardHouseDoc.map(async (bh) => {
            return await getRatingAndPrice(bh._id);
          })
        );

        const combinedData = boardHouseDoc.map((bh, index) => {
          return { ...bh, ...arr[index] };
        });

        return resolve({
          err: 0,
          message: "Ok!",
          data: combinedData,
          arr: arr,
        });
      }

      return resolve({
        err: 0,
        message: "Ok!",
        data: boardHouseDoc,
        arr: arr,
      });
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
};

const getRatingAndPrice = (boardHouseId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const feedbackDoc = await FeedbackOfBoardHouse.find({
        boardHouse: boardHouseId,
      }).select("star");

      function countStar(arr) {
        let count = 0;
        for (let i = 0; i < arr.length; i++) {
          count += parseInt(arr[i].star);
        }

        return parseInt(count) / arr.length;
      }

      const maxPrice = await Room.find({ boardHouseId: boardHouseId })
        .select("price")
        .sort({ price: -1 })
        .limit(1);

      const minPrice = await Room.find({ boardHouseId: boardHouseId })
        .select("price")
        .sort({ price: +1 })
        .limit(1);

      if (minPrice.length > 0 && maxPrice.length > 0) {
        return resolve({
          star: Math.round(countStar(feedbackDoc) * 100) / 100,
          maxPrice: maxPrice[0].price,
          minPrice: minPrice[0].price,
        });
      }

      return resolve({
        star: Math.round(countStar(feedbackDoc) * 100) / 100,
        maxPrice: null,
        minPrice: null,
      });
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
};

const filterBoardHouse = (dataFilter) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log("-----------------------------\n");
      let boardHouseData = [];
      if (!dataFilter.province && dataFilter.min && dataFilter.max) {
        // $gte: greater than or equal to
        // $lte: less than or equal to
        try {
          const intMin = parseInt(dataFilter.min);
          const intMax = parseInt(dataFilter.max);

          const rooms = await Room.find()
            .where("price")
            .gte(intMin)
            .lte(intMax);

          console.log("rooms", rooms);

          const boardHouseIds = rooms.map((room) => room.boardHouseId);

          // $in used to search values in the specified list
          const boardHouseQuery = {
            _id: { $in: boardHouseIds },
          };

          const boardHouses = await BoardHouse.find(boardHouseQuery).lean();
          boardHouseData = boardHouses;
        } catch (err) {
          reject(err);
        }
      } else if (dataFilter.province && !dataFilter.min && !dataFilter.max) {
        const query = {
          "addressFilter.province.value": dataFilter?.province?.value,
        };
        if (dataFilter.district) {
          query["addressFilter.district.value"] = dataFilter.district.value;
        }
        if (dataFilter.ward) {
          query["addressFilter.ward.value"] = dataFilter.ward.value;
        }
        try {
          const boardHouse = await BoardHouse.find(query).lean();
          boardHouseData = boardHouse;
        } catch (error) {
          reject(err);
        }
      } else {
        try {
          const intMin = parseInt(dataFilter.min);
          const intMax = parseInt(dataFilter.max);
          const rooms = await Room.find()
            .where("price")
            .gte(intMin)
            .lte(intMax);

          const boardHouseIds = rooms.map((room) => room.boardHouseId);
          const query = {
            "addressFilter.province.value": dataFilter?.province?.value,
          };
          if (dataFilter.district) {
            query["addressFilter.district.value"] = dataFilter.district.value;
          }
          if (dataFilter.ward) {
            query["addressFilter.ward.value"] = dataFilter.ward.value;
          }

          const boardHouseQuery = {
            ...query,
            _id: { $in: boardHouseIds },
          };

          const boardHouse = await BoardHouse.find(boardHouseQuery).lean();
          boardHouseData = boardHouse;
        } catch (error) {
          reject(err);
        }
      }

      let arr = [];

      if (boardHouseData.length > 0) {
        arr = await Promise.all(
          boardHouseData.map(async (bh) => {
            return await getRatingAndPrice(bh._id);
          })
        );
        const combinedData = boardHouseData.map((bh, index) => {
          return { ...bh, ...arr[index] };
        });
        return resolve({
          err: 0,
          message: "Ok!",
          data: combinedData,
        });
      }

      return resolve({
        err: 0,
        message: "Empty!",
        data: boardHouseData,
        arr: arr,
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
  filterBoardHouse,
  getRatingAndPrice,
};
