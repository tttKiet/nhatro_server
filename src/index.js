const express = require("express");

import * as dotenv from "dotenv";
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.get("/", (req, res) => {
  res.send("Hello Worldss!");
});

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`);
});
