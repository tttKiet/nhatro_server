import { userServices } from "../../services";

class ApiController {
  // [GET] /api/v1/users/all [Kiet]
  getAllUsers(req, res, next) {
    res.send("ok");
  }

  // [POST] /api/v1/users/create [Kiet]
  async handleCreateUser(req, res, next) {
    const { fullName, email, password, type, sdt, address } = req.body;
    const userDoc = await userServices.createUser({
      fullName,
      email,
      password,
      type,
      sdt,
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
    const { phone, pass } = req.body;
    if (!phone || !pass) {
      return res.status(200).json({
        err: 2,
        message: "Thiếu tham số!",
      });
    }
    const response = await userServices.login({ phone, pass });
    return res.status(200).json(response);
  }
}

export default new ApiController();
