import jwt from "jsonwebtoken";
const secretKey = process.env.PRIVATE_KEY_JWT;

const verifyToken = (token) => {
  jwt.verify(token, secretKey, {}, (err, userData) => {
    console.log("userData--------------------: ", userData);
    console.log("token--------------------: ", token);
    if (err) return err;
    else return userData;
  });
};

export { verifyToken };
