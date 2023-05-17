const express = require("express"); // ES5
import route from "./routers"; // ES6
import connectDb from "./config/db";
import * as dotenv from "dotenv";
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Connect to db
connectDb();

route(app);

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`);
});
