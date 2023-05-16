class ApiController {
  // [GET] /
  users(req, res, next) {
    res.send({
      data: [
        {
          name: "The van",
          className: "20v7a2",
        },
        {
          name: "The van",
          className: "20v7a2",
        },
        {
          name: "The van",
          className: "20v7a2",
        },
      ],
    });
  }

  // [GET] /about
  rooms(req, res, next) {
    res.send("all rooms");
  }
}

export default new ApiController();
