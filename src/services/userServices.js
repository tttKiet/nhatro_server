import { User } from "../app/Models";

const createUser = ({ fullName, email, password, type, sdt, address }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const userDoc = await User.create({
        fullName,
        email,
        password,
        type,
        sdt,
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

export { createUser };
