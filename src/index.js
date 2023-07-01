const express = require("express"); // ES5
import cookieParser from "cookie-parser";
import route from "./routers"; // ES6
import connectDb from "./config/db";
import cors from "cors";
import * as dotenv from "dotenv";
dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

// Limit to upload images
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb" }));

// config data resquest
app.use(express.urlencoded());
app.use(express.json());

// use cookie
app.use(cookieParser());

app.use(
  cors({
    origin: [
      "http://127.0.0.1:5173",
      "http://localhost:5173",
      "http://192.168.0.115:5173",
    ], // chỉ cho phép truy cập từ domain này []
    credentials: true,
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
