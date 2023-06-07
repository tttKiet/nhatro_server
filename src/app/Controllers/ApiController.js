import { userServices } from "../../services";

class ApiController {
  // [GET] /api/v1/users/all [Kiet]
  async getAllUsers(req, res, next) {
    const docUsers = await userServices.getAllUsers();
    res.status(200).json(docUsers);
  }

  // [GET] /api/v1/profile [Kiet]
  async getProfile(req, res, next) {
    const token = req.cookies?.token;
    const verifytoken = await userServices.getProfileUser(token);

    if (!token) {
      res.status(200).json({ err: 1, message: "Token not found" });
    } else if (verifytoken === "err") {
      res
        .status(200)
        .json({ err: 2, err: "Verifytoken expiressed or invalid" });
    } else {
      res.status(200).json({ err: 0, token: verifytoken });
    }
  }

  // [GET] /api/v1/loggout [Kiet]
  async handleLoggout(req, res, next) {
    res
      .cookie("token", "", { sameSite: "none", secure: true })
      .status(200)
      .json("ok");
  }

  // [GET] /api/v1/user?_id= [Kiet]
  async getUserById(req, res, next) {
    const _id = req.query._id;
    if (!_id) {
      return res.status(200).json({
        err: 1,
        message: "Lỗi không truyền id người dùng!",
      });
    }

    const docUser = await userServices.getUserById(_id);
    return res.status(200).json(docUser);
  }

  // [DELETE] /api/v1/user/delete/:_id [Kiet]
  async handleDeleteUser(req, res, next) {
    const { _id } = req.params;

    if (!_id) {
      return res.status(200).json({
        err: 1,
        message: "Lỗi không truyền id người dùng!",
      });
    }

    const docUser = await userServices.handleDeleteUser(_id);
    return res.status(200).json(docUser);
  }

  // [patch] /api/v1/user?_id= [Kiet]
  async handleUpdateUser(req, res, next) {
    const _id = req.query._id;
    const { fullName, email, password, phone, address } = req.body;
    if (!_id) {
      return res.status(200).json({
        err: 1,
        message: "Lỗi không truyền id người dùng!",
      });
    }
    if (!fullName || !email || !password || !phone || !address) {
      return res.status(200).json({
        err: 2,
        message: "Lỗi dữ liệu rỗng!",
      });
    }

    const docUser = await userServices.updateUser(_id, {
      fullName,
      email,
      password,
      phone,
      address,
    });
    return res.status(200).json(docUser);
  }

  // [POST] /api/v1/users/create [Kiet]
  async handleCreateUser(req, res, next) {
    const { fullName, email, password, type, phone, address } = req.body;
    const userDoc = await userServices.createUser({
      fullName,
      email,
      password,
      type,
      phone,
      address,
    });
    res.status(200).json(userDoc);
  }

  // [GET] /about
  rooms(req, res, next) {
    res.send("all rooms");
  }

  // [POST] /api/v1/user/login [Kiet]
  async handleLogin(req, res, next) {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(200).json({
        err: 2,
        message: "Thiếu tham số!",
      });
    }
    const response = await userServices.login({ email, password });
    if (response.err === 0) {
      const { token, userData } = response;
      res
        .cookie("token", token, { sameSite: "none", secure: true })
        .json({ err: 0, message: "Login successfully!!", token, userData });
    } else {
      return res.status(200).json(response);
    }
  }

  // [POST] /api/v1/user/login/social  [Kiet]
  async handleLoginWithSocial(req, res, next) {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ err: "Please! Enter your token!" });
    }
    try {
      const response = await userServices.loginWithSocial(token);
      if (response.err === 0) {
        const { token } = response;
        return res
          .cookie("token", token, { sameSite: "none", secure: true })
          .status(200)
          .json({ err: 0, message: "Login successfully!!", token });
      } else {
        return res.status(401).json("Error token!");
      }
    } catch (err) {
      return res.status(401).json("Invalid token!");
    }
  }
  // [GET] /permissions/user/:_id [Kiet]
  async handlePermissionsUser(req, res, next) {
    const { _id } = req.params;
    if (!_id) {
      return res.status(200).json({
        err: 1,
        message: "Thiếu tham số!",
      });
    }
    const response = await userServices.updatePermissions(_id);
    return res.status(200).json(response);
  }

  // [PATCH] /users/:_id [Kiet]
  async handleUpdateInfoUser(req, res, next) {
    const { _id } = req.params;
    const data = req.body;
    if (!_id) {
      return res.status(401).json({
        err: 1,
        message: "Missing _id user!",
      });
    }
    if (Object.keys(data).length === 0) {
      return res.status(501).json("Error updating! 500");
    }

    try {
      const response = await userServices.updateInfoUser(_id, data);
      return res.status(200).json(response);
    } catch (err) {
      return res.status(501).json("Error updating! 501");
    }
  }
}

export default new ApiController();
