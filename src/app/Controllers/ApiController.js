import { feedbackServices, userServices } from "../../services";

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

//[POST] /api/v1/user/feedback/create/:_id ThanThan
  async handleCreateFeedback(req, res, next) {
    const {_id} = req.params
    const {title,content} = req.body
    console.log(_id)
    if (!_id) {
      return res.status(200).json({
        err: 1,
        message: "Lỗi không truyền id người dùng!",
      });
    }
    if(!title || !content ){
      return res.status(200).json({
        err: 2,
        message: "Thiếu nội dung!!",
      });
    }
    const response = await feedbackServices.createFeedback(_id,{title,content})
    return res.status(200).json(response);
    
    // res.status(200).json(FeedBackUser);
  }

  // [patch] /api/v1/user/feedback/update/:_id [Than]


  async handleUpdateFeedback(req, res, next) {
    const {_id} = req.params
    const { title,content } = req.body;
    if (!_id) {
      return res.status(200).json({
        err: 1,
        message: "Lỗi không truyền id người dùng!",
      });
    }
    if (!title || !content) {
      return res.status(200).json({
        err: 2,
        message: "Lỗi nội dung rỗng!",
      });
    }

    const feedbackDoc = await feedbackServices.updateFeedback(_id, {
      title,
      content,
    });
    return res.status(200).json(feedbackDoc);
  }
  
  // [DELETE] /api/v1/user/feedback/delete/:_id [Than]
  async handleDeleteFeedback(req, res, next) {
    const { _id } = req.params;

    if (!_id) {
      return res.status(200).json({
        err: 1,
        message: "Lỗi không truyền id người dùng!",
      });
    }

    const docUser = await feedbackServices.deleteFeedback(_id);
    return res.status(200).json(docUser);
  }


}

export default new ApiController();
