import { User, Account, Code } from "../app/Models";
import jwt from "jsonwebtoken";
import admin from "firebase-admin";
import serviceAccount from "../jsons/firebaseconfigadmin.json";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

import bcrypt from "bcrypt";
const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);

import * as dotenv from "dotenv";
import emailServices from "./emailServices";
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
          avatar: userDoc.avatar,
        };

        jwt.sign(payload, secretKey, { expiresIn: "1d" }, (err, token) => {
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

const loginWithSocial = (token) => {
  return new Promise(async (resolve, reject) => {
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      if (!decodedToken)
        return resolve({
          err: 1,
          message: "Invalid token",
        });

      const {
        name,
        picture,
        uid,
        firebase: { sign_in_provider },
      } = decodedToken;

      const accDoc = await findAccount(uid);
      if (!accDoc) {
        const userDoc = await User.create({
          fullName: name,
          avatar: picture,
          email: "",
          password: "",
          type: "user",
          phone: "",
          address: "",
        });
        if (!userDoc) {
          return resolve({
            err: 2,
            message: "Create User failed!",
          });
        }

        const accDocForUser = await Account.create({
          providerId: sign_in_provider,
          uid: uid,
          userId: userDoc._id,
        });

        if (!accDocForUser) {
          return resolve({
            err: 6,
            message: "Create account failed!",
          });
        }

        const payload = {
          id: userDoc._id,
          fullName: userDoc.fullName,
          email: userDoc.email,
          type: userDoc.type,
          avatar: userDoc.avatar,
        };

        jwt.sign(payload, secretKey, { expiresIn: "1d" }, (err, token) => {
          if (err) {
            return resolve({
              err: 3,
              message: "Create jwt failed!",
            });
          }
          return resolve({
            err: 0,
            token: token,
          });
        });
      } else {
        // having accDoc
        const payload = {
          id: accDoc.userId._id,
          fullName: accDoc.userId.fullName,
          email: accDoc.userId.email,
          type: accDoc.userId.type,
          avatar: accDoc.userId.avatar,
        };
        jwt.sign(payload, secretKey, { expiresIn: "2h" }, (err, token) => {
          if (err) {
            return resolve({
              err: 3,
              message: "Create jwt failed!",
            });
          }
          return resolve({
            err: 0,
            token: token,
          });
        });
      }
    } catch (err) {
      console.log(err);
      reject(err);
    }
  });
};

const findAccount = (uid) => {
  return new Promise(async (resolve, reject) => {
    try {
      const accDoc = await Account.findOne({
        uid: uid,
      }).populate("userId");
      if (accDoc) {
        resolve(accDoc);
      }
      resolve("");
    } catch (error) {
      reject(error);
    }
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

const checkEmailExisted = async (email) => {
  try {
    const res = await User.findOne({ email });
    if (res) return res;
    else return false;
  } catch (error) {
    return "err";
  }
};

const updateInfoUser = async (_id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { email, bio, fullName, address, phone, school, personalities } =
        data;
      if (!email || !fullName || !address || !phone) {
        return resolve({
          err: 1,
          message: `Missing iunput pagrams`,
        });
      }
      const emailExisted = await checkEmailExisted(email);
      if (emailExisted && !emailExisted._id.equals(_id)) {
        return resolve({
          err: 4,
          message: `Email existed!`,
        });
      }
      const isValid = ObjectId.isValid(_id);
      if (!isValid) {
        return resolve({
          err: 2,
          message: `${_id} invalid!`,
        });
      }

      const userDoc = await User.findByIdAndUpdate(
        { _id },
        {
          email,
          bio: bio ? bio : "",
          fullName,
          address,
          phone,
          school: school ? school : "",
          personalities:
            personalities && personalities.length > 0 ? personalities : [],
        }
      );

      if (userDoc) {
        return resolve({
          err: 0,
          message: `Updated informaiton!`,
        });
      } else {
        return resolve({
          err: 5,
          message: `No found user!`,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

const verifyTokenEmail = (email, userId, code) => {
  return new Promise(async (resolve, reject) => {
    try {
      const isValid = ObjectId.isValid(userId);
      if (!isValid) {
        return resolve({
          err: 1,
          message: `Id:${userId} invalid!`,
        });
      }
      if (code.length !== 6) {
        return resolve({
          err: 2,
          message: `Code:${code} invalid!`,
        });
      }

      const currentTimestamp = new Date();
      const codeDoc = await Code.findOneAndDelete({
        user: userId,
        code,
        email,
        expires: { $gt: currentTimestamp },
      }).sort({ expires: -1 });

      if (!codeDoc) {
        return resolve({
          err: 3,
          message: `Code don't match! The code has expired or is not correct!`,
        });
      } else {
        const userUpdate = await User.findByIdAndUpdate(
          { _id: userId },
          {
            email: email,
            emailVerified: true,
          }
        );

        if (!userUpdate) {
          return resolve({
            err: 4,
            message: `${email} has not been verified!`,
          });
        }

        return resolve({
          err: 0,
          message: `${email} has been verified!`,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

const sendCodeEmail = async (email, userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const isValid = ObjectId.isValid(userId);
      if (!isValid) {
        return resolve({
          err: 1,
          message: `Id:${userId} invalid!`,
        });
      }

      const user = await User.findOne({ _id: userId });

      if (!user) {
        return resolve({
          err: 2,
          message: "User not found!",
        });
      } else {
        const emailExisted = await checkEmailExisted(email);
        if (emailExisted && !emailExisted._id.equals(userId)) {
          return resolve({ err: 5, message: "Email exsted!" });
        }
        const emailVerCode = await emailServices.sendCodeEmail(email);
        if (!emailVerCode) {
          return resolve({ err: 3, message: "Failed when send code!" });
        }

        const codeDoc = await Code.create({
          code: emailVerCode,
          user: userId,
          email: email,
        });

        if (!codeDoc) {
          return resolve({
            err: 4,
            message: "Error when save db!",
          });
        }

        return resolve({
          err: 0,
          message: "OK!",
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

const changeAvatar = async (userId, img) => {
  return new Promise(async (resolve, reject) => {
    try {
      const isValid = ObjectId.isValid(userId);
      if (!isValid) {
        return resolve({
          err: 1,
          message: `UserId not valid`,
        });
      }

      const userDoc = await User.findByIdAndUpdate(userId, { avatar: img });
      if (userDoc) {
        return resolve({
          err: 0,
          message: `Change avatar successfuly`,
        });
      }

      return resolve({
        err: 2,
        message: `Something went wrong at changeAvatar`,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const changePassword = async (userId, oldPassword, newPassword) => {
  return new Promise(async (resolve, reject) => {
    try {
      const isValid = ObjectId.isValid(userId);
      if (!isValid) {
        return resolve({
          err: 1,
          message: `UserId not valid`,
        });
      }

      let userDoc = await User.findById(userId);
      const isComparePassword = await bcrypt.compareSync(
        oldPassword,
        userDoc.password
      );

      if (!isComparePassword) {
        return resolve({
          err: 3,
          message: `Your password not true, please enter the right password`,
        });
      }

      const hashPassword = bcrypt.hashSync(newPassword, salt);

      try {
        userDoc = await User.findByIdAndUpdate(userId, {
          password: hashPassword,
        });

        if (userDoc) {
          return resolve({
            err: 0,
            message: `Change password successfully`,
          });
        }
      } catch (error) {
        return resolve({
          err: 2,
          message: `Something went wrong at changePassword`,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

export default {
  typeUser,
  createUser,
  login,
  getAllUsers,
  getUserById,
  updateUser,
  handleDeleteUser,
  updatePermissions,
  getProfileUser,
  loginWithSocial,
  updateInfoUser,
  sendCodeEmail,
  verifyTokenEmail,
  changeAvatar,
  changePassword,
};
