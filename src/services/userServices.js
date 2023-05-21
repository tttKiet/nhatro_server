import { User } from "../app/Models";

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
  try {
    const users = await User.find();
    if (users)
      return {
        err: 0,
        message: "Get Users thanh cong",
        dataUser: users,
      };
    else {
      return {
        err: 1,
        message: "Get Users that bai",
      };
    }
  } catch (error) {
    console.log(error);
    return {
      err: 2,
      message: error,
    };
  }
};

export default { createUser, login, getAllUsers };
