import { User } from "../app/Models";
var ObjectId = require("mongoose").Types.ObjectId;

const createUser = ({ fullName, email, password, type, phone, address }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const userDoc = await User.create({
        fullName,
        email,
        password,
        type,
        phone,
        address,
      });

      if (userDoc) {
        resolve({
          err: 0,
          message: "Đã tạo người dùng!",
        });
      }

      resolve({
        err: 1,
        message: `Đã có lỗi xảy ra userService!!`,
      });
    } catch (err) {
      reject(err);
    }
  });
};
const updateUser = (_id, { fullName, email, password, phone, address }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const isValid = ObjectId.isValid(_id);
      if (!isValid) {
        return resolve({
          err: 3,
          message: `${_id} không phải là id đúng định dạng!`,
        });
      }

      const userDoc = await User.findOneAndUpdate(
        { _id },
        {
          fullName,
          email,
          password,
          phone,
          address,
        }
      );

      if (userDoc) {
        return resolve({
          err: 0,
          message: "Đã Cập nhật người dùng!",
        });
      }

      resolve({
        err: 1,
        message: `Không tìm thấy thông tin người dùng ${_id}!`,
      });
    } catch (err) {
      reject(err);
    }
  });
};

const login = ({ phone, pass }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const userDoc = await User.findOne({ phone, password: pass });
      if (!userDoc) {
        resolve({ err: 1, message: "Số điện hoặc mật khẩu không đúng!" });
      }

      userDoc.password = "#";
      resolve({ err: 0, message: "Đăng nhập thành công!", dataUser: userDoc });
    } catch (err) {
      reject(err);
    }
  });
};

const getAllUsers = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const users = await User.find();
      if (users)
        resolve({
          err: 0,
          message: "Get Users thanh cong",
          dataUser: users,
        });
      else {
        resolve({
          err: 1,
          message: "Get Users that bai",
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

const getUserById = async (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const isValid = ObjectId.isValid(id);
      if (!isValid) {
        return resolve({
          err: 3,
          message: `${id} không phải là id đúng định dạng!`,
        });
      }
      const user = await User.findById(id).exec();
      if (user)
        return resolve({
          err: 0,
          message: `Lấy thông tin người dùng ${id} thành công!`,
          dataUser: user,
        });
      else {
        resolve({
          err: 2,
          message: `Không tìm thấy thông tin người dùng ${id}!`,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

const handleDeleteUser = async (_id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const isValid = ObjectId.isValid(_id);
      if (!isValid) {
        return resolve({
          err: 3,
          message: `${_id} không phải là id đúng định dạng!`,
        });
      }
      const user = await User.deleteOne({ _id });
      if (user)
        return resolve({
          err: 0,
          message: `Xóa người dùng ${_id} thành công!`,
          dataUser: user,
        });
      else {
        resolve({
          err: 2,
          message: `Không tìm thấy thông tin người dùng ${_id}!`,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

export default {
  createUser,
  login,
  getAllUsers,
  getUserById,
  updateUser,
  handleDeleteUser,
};
