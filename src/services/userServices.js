import { User } from "../app/Models";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);
import * as dotenv from "dotenv";
dotenv.config();
const secretKey = process.env.PRIVATE_KEY_JWT;

var ObjectId = require("mongoose").Types.ObjectId;

const createUser = ({ fullName, email, password, type, phone, address }) => {
  return new Promise(async (resolve, reject) => {
    const userExits = await User.findOne({ email });
    if (userExits) {
      return resolve({
        err: 2,
        message: "Email existed!",
      });
    }
    const hashPassword = bcrypt.hashSync(password, salt);
    try {
      const userDoc = await User.create({
        fullName,
        email,
        password: hashPassword,
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

const login = ({ email, password }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const userDoc = await User.findOne({ email });
      if (!userDoc) {
        return resolve({ err: 1, message: "Email no existed!" });
      }

      const isComparePassword = await bcrypt.compareSync(
        password,
        userDoc.password
      );

      if (isComparePassword) {
        // create token
        const payload = {
          id: userDoc._id,
          fullName: userDoc.fullName,
          email: userDoc.email,
          type: userDoc.type,
        };

        jwt.sign(payload, secretKey, { expiresIn: "2h" }, (err, token) => {
          if (err) {
            return resolve({
              err: 1,
              message: "err",
            });
          }
          return resolve({
            err: 0,
            token: token,
          });
        });
      } else {
        return resolve({
          err: 2,
          message: "Email or password done sure!",
        });
      }
    } catch (err) {
      reject(err);
    }
  });
};

const getProfileUser = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secretKey, {}, (err, userData) => {
      if (err) resolve("err");
      resolve(userData);
    });
  });
};

const getAllUsers = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const users = await User.find({ type: { $ne: "root" } });
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

const updatePermissions = (_id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const isValid = ObjectId.isValid(_id);
      if (!isValid) {
        return resolve({
          err: 2,
          message: `${_id} không phải là id đúng định dạng!`,
        });
      }

      const { type } = await typeUser(_id);
      if (type === "admin") {
        // handle database when delete admin permissions
        // ...
        // end
        // update db
        const userUpdate = await User.updateOne({ _id }, { type: "user" });
        if (userUpdate) {
          resolve({
            err: 0,
            message: "Demoted user successfully!",
          });
        } else {
          resolve({
            err: 1,
            message: "Demoted user fail!",
          });
        }
      } else if (type === "user") {
        const { emailVerified } = await checkEmailVerified(_id);
        if (!emailVerified) {
          resolve({
            err: 2,
            message: "Upgrade user error so that email is not verified!",
          });
        } else {
          const userUpdate = await User.updateOne({ _id }, { type: "admin" });
          if (userUpdate) {
            resolve({
              err: 0,
              message: "Upgrade user successfully!",
            });
          } else {
            resolve({
              err: 1,
              message: "Upgrade user fail!",
            });
          }
        }
      }
      resolve({
        err: 3,
        message: "Error!",
      });
    } catch (error) {
      reject(error);
    }
  });
};

const typeUser = async (_id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await User.findOne({ _id });
      if (!user) {
        resolve({ err: 1, message: "User not found!" });
      } else {
        resolve({ err: 0, message: "OK!", type: user.type });
      }
    } catch (error) {
      reject(error);
    }
  });
};

const checkEmailVerified = async (_id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await User.findOne({ _id });
      if (!user) {
        resolve({ err: 1, message: "User not found!" });
      } else {
        resolve({ err: 0, message: "OK!", emailVerified: user.emailVerified });
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
  updatePermissions,
  getProfileUser,
};
