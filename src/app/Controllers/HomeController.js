class HomeController {
  // [GET] /
  index(req, res, next) {
    // db
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
  about(req, res, next) {
    res.send("about");
  }
}

export default new HomeController();
