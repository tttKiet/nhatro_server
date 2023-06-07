import jwt from "jsonwebtoken";
const secretKey = process.env.PRIVATE_KEY_JWT;

const verifyToken = (token) => {
  jwt.verify(token, secretKey, {}, (err, userData) => {
    if (err) return err;
    else return userData;
  });
};

export { verifyToken };
