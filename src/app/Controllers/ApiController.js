import { createUser } from "../../services/userServices";

class ApiController {
  // [GET] /api/v1/users/all [Kiet]
  getAllUsers(req, res, next) {
    res.send("ok");
  }

  // [POST] /api/v1/users/create [Kiet]
  async handleCreateUser(req, res, next) {
    const { fullName, email, password, type, sdt, address } = req.body;
    const userDoc = await createUser({
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
}

export default new ApiController();
