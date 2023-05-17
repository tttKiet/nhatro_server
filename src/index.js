const express = require("express"); // ES5
import route from "./routers"; // ES6
import connectDb from "./config/db";
import cors from "cors";
import * as dotenv from "dotenv";
dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

// config data resquest
app.use(express.urlencoded());
app.use(express.json());

app.use(
  cors({
    origin: "http://127.0.0.1:5173", // chỉ cho phép truy cập từ domain này []
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], // chỉ cho phép sử dụng các phương thức này
    // allowedHeaders: ["Content-Type"], // chỉ cho phép sử dụng các header này
  })
);

// Connect to db
connectDb();

route(app);

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`);
});
