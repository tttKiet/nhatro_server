import {
  userServices,
  boardHouseServices,
  roomServices,
  emailServices,
  codeServices,
  commentServices,
  cloudinaryServices,
  reqRoomOwnerServices,
  feedbackServices,
  postServices,
  likeServices,
  favouritePostServices,
} from "../../services";
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
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

  // [POST] /api/v1/board-house/create [The Van]
  async handleCreateBoardHouse(req, res, next) {
    const { adminId } = req.body;
    if (!adminId) {
      return res.status(200).json({
        err: 1,
        message: "Missing adminId",
      });
    }
    const response = await boardHouseServices.createBoardHouse({
      adminId,
    });
    return res.status(200).json(response);
  }

  // [PATCH] /api/v1/board-house/update/:id[The Van]
  async handleUpdateBoardHouse(req, res, next) {
    const { id } = req.params;
    const { name, address, phone, electricPrice, waterPrice, imgToDelete } =
      req.body;
    const files = req.files;

    if (!name || !address || !phone || !electricPrice || !waterPrice) {
      return res.status(400).json({
        err: 1,
        message: "Missing data",
      });
    }

    // delete img on cloudinary
    let arrImgToDelete = [];
    if (imgToDelete.length > 0) {
      arrImgToDelete = imgToDelete.split(",");
    }
    if (arrImgToDelete && arrImgToDelete.length > 0) {
      try {
        await Promise.all(
          arrImgToDelete.map(async (img) => {
            const path = img.slice(
              img.indexOf("/motel_posts/") + 1,
              img.lastIndexOf(".")
            );
            console.log("path: ", path);

            await cloudinary.uploader.destroy(path);
          })
        );
      } catch (error) {
        console.log("loi", error);
      }
    }

    try {
      const response = await boardHouseServices.updateBoardHouse(id, {
        name,
        address,
        phone,
        electricPrice,
        waterPrice,
        arrImgToDelete,
        files,
      });

      return res.status(200).json(response);
    } catch (error) {
      console.log(error);
    }
  }

  // [DELETE] /api/v1/board-house/delete/:_id?adminId= & rootId= [The Van]
  async handleDeleteBoardHouse(req, res, next) {
    const { id } = req.params;
    const { adminId, rootId } = req.query;

    if (!adminId || !rootId || !id) {
      return res.status(200).json({
        err: 1,
        message: "Thiếu id",
      });
    }

    const response = await boardHouseServices.deleteBoardHouse(
      adminId,
      rootId,
      id
    );
    return res.status(200).json(response);
  }
  // [GET] /api/v1/board-house? adminId= [The Van]
  async handleGetBoardHouse(req, res, next) {
    const { adminId } = req.query;
    if (!adminId) {
      return res.status(200).json({
        err: 1,
        message: "Thiếu id",
      });
    }

    const response = await boardHouseServices.getBoardHouseById(adminId);
    return res.status(200).json(response);
  }

  // [POST] /api/v1/board-house/room/create/:id [The Van]
  async handleCreateRoom(req, res, next) {
    const { id } = req.params;
    const { number, size, isLayout, price, description } = req.body;
    const files = req.files;

    if (!number || !size || !price || !isLayout || !description) {
      return res.status(400).json({
        err: 1,
        message: "Missing data",
      });
    }

    try {
      const response = await roomServices.createRoom(
        id,
        number,
        size,
        isLayout,
        price,
        description,
        files
      );

      if (response.err === 0) {
        return res.status(200).json(response);
      } else {
        if (files.length > 0) {
          files.forEach((file) => {
            cloudinary.uploader.destroy(file.filename);
          });
        }
        return res.status(400).json(response);
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  }

  // [GET] /api/v1/board-house/room? adminId= [The Van]
  async handleGetAllRooms(req, res, next) {
    const { adminId } = req.query;
    if (!adminId) {
      return res.status(200).json({
        err: 1,
        message: "Thiếu adminId",
      });
    }
    const response = await roomServices.getAllRoomsByAdminId(adminId);
    return res.status(200).json(response);
  }

  // [DELETE] /api/v1/board-house/room/delete/:id [The Van]
  async handleDeleteRoom(req, res, next) {
    const { id } = req.params;
    const imgsToDelete = req.body;

    if (!id || !imgsToDelete) {
      return res.status(200).json({
        err: 1,
        message: "Missing parameter",
      });
    }

    try {
      const response = await roomServices.deleteRoomById(id);
      if (response.err === 0) {
        if (imgsToDelete && imgsToDelete.length > 0) {
          try {
            await Promise.all(
              imgsToDelete.map(async (img) => {
                const path = img.slice(
                  img.indexOf("/motel_posts/") + 1,
                  img.lastIndexOf(".")
                );
                console.log("path: ", path);
                await cloudinary.uploader.destroy(path);
              })
            );
          } catch (error) {
            console.log("error", error);
          }

          return res.status(200).json(response);
        }
      } else {
        return res.status(400).json(response);
      }
    } catch (error) {
      return res.status(501).json(error);
    }
  }

  // [PATCH] /api/v1/board-house/room/update/:id [The Van]
  async handleUpdateRoom(req, res, next) {
    const { id } = req.params;
    const { number, size, isLayout, price, description, imgToDelete } =
      req.body;
    const files = req.files;

    if (!number || !size || !price || !isLayout || !description) {
      return res.status(400).json({
        err: 1,
        message: "Missing data",
      });
    }

    // delete img on cloudinary
    let arrImgToDelete = [];
    if (imgToDelete.length > 0) {
      arrImgToDelete = imgToDelete.split(",");
    }
    if (arrImgToDelete && arrImgToDelete.length > 0) {
      try {
        await Promise.all(
          arrImgToDelete.map(async (img) => {
            const path = img.slice(
              img.indexOf("/motel_posts/") + 1,
              img.lastIndexOf(".")
            );

            await cloudinary.uploader.destroy(path);
          })
        );
      } catch (error) {
        console.log("error", error);
      }
    }

    const response = await roomServices.updateRoom(id, {
      number,
      size,
      isLayout,
      price,
      description,
      arrImgToDelete,
      files,
    });

    return res.status(200).json(response);
  }

  // [GET] /api/v1/board-house/page/:number
  async handleGetBoardHouseAll(req, res, next) {
    const { number } = req.params;

    try {
      const response = await boardHouseServices.getBoardHouseAll({
        number,
      });

      if (response.err === 0) {
        return res.status(200).json(response);
      } else {
        return res.status(400).json(response);
      }
    } catch (err) {
      return res.status(500).json("Error ");
    }
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

  // [POST] /api/v1/upload-image [The Van]
  async handleUploadImage(req, res, next) {
    const { image } = req.body;

    if (!image) {
      return res.status(401).json({
        err: 1,
        message: "Missing image",
      });
    }
    const response = await cloudinaryServices.uploadImage(image);
    return res.status(200).json(response);
  }

  // [POST] /api/v1//upload-images [The Van]
  async handleUploadImages(req, res, next) {
    const { images } = req.body;

    if (!images) {
      return res.status(401).json({
        err: 1,
        message: "Missing image",
      });
    }
    const response = await cloudinaryServices.uploadMultipleImages(images);
    return res.status(200).json(response);
  }

  // [POST] /api/v1/delete-image [The Van]
  async handleDeleteImage(req, res, next) {
    const { imageLink } = req.body;

    if (!imageLink) {
      return res.status(401).json({
        err: 1,
        message: "Missing image",
      });
    }
    const response = await cloudinaryServices.deleteSingleImg(imageLink);
    return res.status(200).json(response);
  }

  // [POST] /api/v1/delete-images [The Van]
  async handleDeleteImages(req, res, next) {
    const { imageLinks } = req.body;

    if (!imageLinks) {
      return res.status(401).json({
        err: 1,
        message: "Missing image",
      });
    }
    const response = await cloudinaryServices.deleteMultiplyImgs(imageLinks);
    return res.status(200).json(response);
  }

  // [POST] /user/verify/email/send-code [Kiet]
  async handleSendCodeEmail(req, res, next) {
    const { email, userId } = req.body;
    if (!email || !userId) {
      return res
        .status(401)
        .json("Invalid email address! Please enter a valid email address.");
    }
    const response = await userServices.sendCodeEmail(email, userId);
    if (response.err === 0) {
      return res.status(200).json(response);
    }
    return res.status(400).json(response);
  }

  // [POST] /user/verify/email/verify-code [Kiet]
  async handleVerifyCodeEmail(req, res, next) {
    const { code, userId, email } = req.body;
    if (!code || !userId || !email) {
      return res.status(401).json("Missing code or user");
    }
    const response = await userServices.verifyTokenEmail(email, userId, code);
    if (response.err === 0) {
      return res.status(200).json(response);
    }
    return res.status(400).json(response);
  }

  // [POST] /user/verify/email/check-exist-code [Kiet]
  async handleCheckExistCodeEmail(req, res, next) {
    const { email } = req.body;
    if (!email) {
      return res.status(401).json("Missing email!");
    }
    const isHaveCode = await codeServices.checkCodeForEmail(email);
    if (isHaveCode) {
      return res.status(200).json({ err: 0, message: "Existed code!" });
    }
    return res.status(200).json({ err: 1, message: "Not existed code!" });
  }

  // [POST] /api/v1/user/:_id/create-req-board-house [The Van]
  async handleCreateReqBoardHouse(req, res, next) {
    const { name, address, phone, electric, water, description } = req.body;

    const { _id } = req.params;
    const files = req.files;

    if (!name || !address || !phone || !electric || !water || !description) {
      return res.status(401).json("Missing data!");
    }

    // Create a new board house

    try {
      const boardHouseRes = await boardHouseServices.createBoardHouseFromReq({
        _id,
        name,
        address,
        phone,
        electric,
        water,
        files,
      });

      if (boardHouseRes.err === 0) {
        const reqRes = await reqRoomOwnerServices.createReqRoomOwner(
          _id,
          boardHouseRes.boardHouseId,
          description
        );
        return res.status(200).json(reqRes);
      }
    } catch (error) {
      return res.status(500).json(error);
    }

    return res.status(401).json({
      err: 1,
      message: "Something went wrong at handleCreateReqBoardHouse",
    });
  }

  // [GET] /api/v1/root/all-request-board-house/:id [The Van]
  async handleGetAllRequest(req, res, next) {
    const { id } = req.params;

    if (!id) {
      return res.status(401).json("Missing data!");
    }

    const response = await reqRoomOwnerServices.getAllReq(id);

    return res.status(200).json(response);
  }

  // [GET] /api/v1/user/:_id/all-request-board-house [Bui Kiet]
  async handleGetAllRequestUser(req, res, next) {
    const { _id } = req.params;

    if (!_id) {
      return res.status(401).json("Missing data!");
    }

    try {
      const response = await reqRoomOwnerServices.getReqOwnerByUserId(_id);
      if (response.err === 0) {
        return res.status(200).json(response);
      } else {
        return res.status(401).json(response);
      }
    } catch (err) {
      return res.status(401).json("Error from server!");
    }
  }

  //[POST] /api/v1/user/feedback/create/:_id ThanThan
  async handleCreateFeedback(req, res, next) {
    const { _id } = req.params;
    const data = req.body;

    const { title, message } = data;
    if (!_id) {
      return res.status(400).json({
        err: 1,
        message: "Missing id!",
      });
    }
    if (!title || !message) {
      return res.status(400).json({
        err: 2,
        message: "Missing data",
      });
    }
    try {
      const response = await feedbackServices.createFeedback(_id, {
        title,
        message,
      });
      return res.status(200).json(response);
    } catch (err) {
      return res.status(401).json(err);
    }
  }

  // [patch] /api/v1/user/feedback/update/:_id [Than]

  async handleUpdateFeedback(req, res, next) {
    const { _id } = req.params;
    const { title, content } = req.body;
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

  // [DELETE] /user/:_id/delete-feedback?fbId=
  async handleDeleteFeedback(req, res, next) {
    const { _id } = req.params;
    const { fbId } = req.query;

    if (!_id || !fbId) {
      return res.status(400).json({
        err: 1,
        message: "Missing id",
      });
    }
    try {
      const response = await feedbackServices.deleteFeedback(fbId, _id);
      return res.status(200).json(response);
    } catch (error) {
      return res.status(500).json(error);
    }
  }

  // [GET] /user/:_id/all-feedbacks

  async getAllFeedbacksById(req, res, next) {
    const { _id } = req.params;
    if (!_id) {
      return res.status(400).json({
        err: 1,
        message: "Missing Id!",
      });
    }
    try {
      const response = await feedbackServices.getAllFeedbackByUserId(_id);
      return res.status(200).json(response);
    } catch (error) {
      return res.status(500).json(error);
    }
  }

  // /user/:_id/up-post [Kiet]
  async handleUpPost(req, res, next) {
    const { content, hashTag } = req.body;
    const { _id } = req.params;
    const files = req.files;

    if (!content || !_id) {
      if (files.length > 0) {
        files.forEach((file) => {
          cloudinary.uploader.destroy(file.filename);
        });
      }
      return res.status(400).json({
        err: 1,
        errMessage: "Missing parameters!!",
      });
    }

    try {
      const response = await postServices.createPost({
        _id,
        files,
        hashTag,
        content,
      });

      if (response.err === 0) {
        return res.status(200).json(response);
      } else {
        if (files.length > 0) {
          files.forEach((file) => {
            cloudinary.uploader.destroy(file.filename);
          });
        }

        return res.status(400).json(response);
      }
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  }

  // /user/:_id/edit-post [Kiet]
  async handleEditPost(req, res, next) {
    const { content, hashTag, postId } = req.body;
    const { _id } = req.params;
    const files = req.files;
    console.log("postId ", postId);
    if (!content || !_id || !postId) {
      if (files?.length > 0) {
        files.forEach((file) => {
          cloudinary.uploader.destroy(file.filename);
        });
      }
      return res.status(400).json({
        err: 1,
        errMessage: "Missing parameters!!",
      });
    }

    try {
      const response = await postServices.editPost({
        _id,
        files,
        postId,
        hashTag,
        content,
      });

      if (response.err === 0) {
        return res.status(200).json(response);
      } else {
        if (files.length > 0) {
          files.forEach((file) => {
            cloudinary.uploader.destroy(file.filename);
          });
        }

        return res.status(400).json(response);
      }
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  }

  // [PATCH] /api/v1/root/accept-req/:id [The Van]
  async handleAcceptReq(req, res, next) {
    const { id } = req.params;

    if (!id) {
      return res.status(401).json("Missing data!");
    }

    const response = await reqRoomOwnerServices.acceptReq(id);

    return res.status(200).json(response);
  }

  async handleRejectReq(req, res, next) {
    const { id } = req.params;
    const { boardHouseId } = req.body;
    console.log("first", boardHouseId);

    if (!id || !boardHouseId) {
      return res.status(401).json("Missing data!");
    }

    const response = await reqRoomOwnerServices.rejectReq(id, boardHouseId);

    return res.status(200).json(response);
  }

  // [POST] /api/v1/user/change-avatar" [The Van]
  async handleChangeAvatar(req, res, next) {
    const { id, imgToDelete } = req.body;
    const files = req.files;

    if (!id || !imgToDelete || !files) {
      return res.status(400).json({
        err: 1,
        errMessage: "Missing data!!",
      });
    }

    // delete img
    if (imgToDelete.length > 0) {
      const path = imgToDelete.slice(
        imgToDelete.indexOf("/motel_posts/") + 1,
        imgToDelete.lastIndexOf(".")
      );
      console.log(path);
      try {
        await cloudinary.uploader.destroy(path);
      } catch (error) {
        console.log("error", error);
      }
    }

    try {
      const response = await userServices.changeAvatar(id, files[0].path);
      if (response.err === 0) {
        return res.status(200).json(response);
      } else {
        return res.status(400).json(response);
      }
    } catch (error) {
      return res.status(500).json(error);
    }
  }

  // /posts?page= [Kiet]
  async handleGetPost(req, res, next) {
    const { page } = req.query;
    try {
      const response = await postServices.getPosts({ page });
      if (response.err === 0) {
        return res.status(200).json(response);
      } else {
        return res.status(400).json(response);
      }
    } catch (err) {
      return res.status(500).json(err);
    }
  }

  // /users/:_id/posts?index= [Kiet]
  async handleUserGetPost(req, res, next) {
    const { index, page } = req.query;
    const { _id } = req.params;
    try {
      const response = await postServices.getUserPost({
        index,
        _author: _id,
        page,
      });
      if (response.err === 0) {
        return res.status(200).json(response);
      } else {
        return res.status(400).json(response);
      }
    } catch (err) {
      return res.status(500).json(err);
    }
  }

  // /post/:id/like [Kiet]
  async handleToggleLikePost(req, res, next) {
    const { id } = req.params;
    const { userId } = req.body;
    try {
      const response = await likeServices.toggleLike({ userId, postId: id });
      if (response.err === 0) {
        return res.status(200).json(response);
      } else {
        return res.status(400).json(response);
      }
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  }

  // /post/:id/like [Kiet]
  async handleGetLikePost(req, res, next) {
    const { id } = req.params;
    try {
      const response = await postServices.getLike({ postId: id });
      if (response.err === 0) {
        return res.status(200).json(response);
      } else {
        return res.status(400).json(response);
      }
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  }

  // /post/:id/comment [Kiet]
  async handleGetComment(req, res, next) {
    const { page } = req.query;
    const { id } = req.params;

    try {
      const response = await commentServices.getCommentPost(id, page);
      if (response.err === 0) {
        return res.status(200).json(response);
      } else {
        return res.status(400).json(response);
      }
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  }

  // /comment [Kiet]
  async handleComment(req, res, next) {
    const { content, userId, postId, parentId } = req.body;

    if (!content || !userId || (!postId && !parentId)) {
      return res.status(404).json({ message: "Missing input!" });
    }

    try {
      const response = await commentServices.createCmt({
        content,
        userId,
        postId,
        parentId,
      });
      if (response.err === 0) {
        return res.status(200).json(response);
      } else {
        return res.status(400).json(response);
      }
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  }

  // [POST] "/user/:_id/add-favourite-post?postId=" [The Van]
  async handleAddFavouritePost(req, res, next) {
    const { postId } = req.query;
    const { _id } = req.params;

    if (!postId || !_id) {
      return res.status(400).json({ message: "Missing id!" });
    }

    try {
      const response = await favouritePostServices.createFavouritePost(
        postId,
        _id
      );
      if (response.err === 0) {
        return res.status(200).json(response);
      } else {
        return res.status(400).json(response);
      }
    } catch (error) {
      return res.status(500).json(error);
    }
  }

  // [GET] "/user/:_id/favourite-post" [The Van]
  async handleGetFavouritePost(req, res, next) {
    const { _id } = req.params;

    if (!_id) {
      return res.status(400).json({ message: "Missing id!" });
    }

    try {
      const response = await favouritePostServices.getFavouritePost(_id);

      return res.status(200).json(response);
    } catch (error) {
      return res.status(500).json(error);
    }
  }

  // [DELETE] "/user/:_id/remove-favourite-post?fvPostId=" [The Van]
  async handleRemoveFavouritePost(req, res, next) {
    const { _id } = req.params;
    const { fvPostId } = req.query;

    if (!_id || !fvPostId) {
      return res.status(400).json({ message: "Missing id!" });
    }

    try {
      const response = await favouritePostServices.removeFavouritePost(
        _id,
        fvPostId
      );

      return res.status(200).json(response);
    } catch (error) {
      return res.status(500).json(error);
    }
  }

  // /comment/:id/child [Kiet]
  async handleGetChildComment(req, res, next) {
    const { page, type } = req.query;
    const { id } = req.params;

    try {
      const response = await commentServices.getChildCommentById({
        id,
        page,
        type,
      });
      if (response.err === 0) {
        return res.status(200).json(response);
      } else {
        return res.status(400).json(response);
      }
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  }

  // /comment/:id [Kiet]
  async handleEditComment(req, res, next) {
    const { id } = req.params;
    const { content } = req.body;
    if (!content) {
      return res.status(400).json("Missing content!");
    }

    try {
      const response = await commentServices.editComment({
        id,
        content,
      });
      if (response.err === 0) {
        return res.status(200).json(response);
      } else {
        return res.status(400).json(response);
      }
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  }

  // /comment/:id/child [Kiet]
  async handleGetLimitComment(req, res, next) {
    const { postId } = req.query;

    try {
      const response = await commentServices.getLimitComments({
        postId,
      });
      if (response.err === 0) {
        return res.status(200).json(response);
      } else {
        return res.status(400).json(response);
      }
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  }

  // /post/:_id [Kiet]
  async handleGetPostById(req, res, next) {
    const { _id } = req.params;

    try {
      const response = await postServices.getPostById({
        postId: _id,
      });
      if (response.err === 0) {
        return res.status(200).json(response);
      } else {
        return res.status(400).json(response);
      }
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  }

  // /post/:_id [Kiet]
  async handleDeletePostById(req, res, next) {
    const { _id } = req.params;

    try {
      const response = await postServices.deletePostById({
        postId: _id,
      });
      if (response.err === 0) {
        return res.status(200).json(response);
      } else {
        return res.status(400).json(response);
      }
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  }

  // /comment/:_id [Kiet]
  async handleDeleteComment(req, res, next) {
    const { id } = req.params;

    try {
      const response = await commentServices.deleteCmtById({
        id,
      });
      if (response.err === 0) {
        return res.status(200).json(response);
      } else {
        return res.status(400).json(response);
      }
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  }
}

export default new ApiController();
