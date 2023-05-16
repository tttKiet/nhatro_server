const express = require("express");
import route from "./routers";
import * as dotenv from "dotenv";
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

route(app);

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`);
});
