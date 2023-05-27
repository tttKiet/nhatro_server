import { userServices, boardHouseServices } from "../../services";

class ApiController {
  // [GET] /api/v1/users/all [Kiet]
  async getAllUsers(req, res, next) {
    const docUsers = await userServices.getAllUsers();
    res.status(200).json(docUsers);
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
    return res.status(200).json(response);
  }

  // [POST] /api/v1/board-house/create [The Van]
  async handleCreateBoardHouse(req, res, next) {
    const { adminId, rootId } = req.body;
    if (!adminId || !rootId) {
      return res.status(200).json({
        err: 1,
        message: "Thiếu id của admin hoặc root",
      });
    }
    const response = await boardHouseServices.createBoardHouse({
      adminId,
      rootId,
    });
    return res.status(200).json(response);
  }

  // [PATCH] /api/v1/board-house/update?adminId= & boardHouseId= [The Van]
  async handleUpdateBoardHouse(req, res, next) {
    const { adminId, boardHouseId } = req.query;
    const { name, address, phone, electricPrice, waterPrice, images } =
      req.body;

    // Cần xử lý dữ liệu đầu vào từ body
    if (!adminId || !boardHouseId) {
      return res.status(200).json({
        err: 1,
        message: "Thiếu id",
      });
    }
    const response = await boardHouseServices.updateBoardHouse(
      adminId,
      boardHouseId,
      { name, address, phone, electricPrice, waterPrice, images }
    );
    return res.status(200).json(response);
  }
}

export default new ApiController();
